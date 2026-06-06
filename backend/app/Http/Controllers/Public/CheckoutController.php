<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUse;
use App\Models\Course;
use App\Models\Enrolment;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function show(string $courseId): JsonResponse
    {
        $course = Course::where('id', $courseId)
            ->where('status', 'published')
            ->with('creator:id,name,slug,avatar_url,razorpay_account_id')
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                 => $course->id,
                'title'              => $course->title,
                'description'        => $course->description,
                'thumbnail_url'      => $course->thumbnail_url,
                'pricing_type'       => $course->pricing_type,
                'price_inr'          => $course->price_inr,
                'original_price_inr' => $course->original_price_inr,
                'creator'            => $course->creator->only(['id', 'name', 'slug', 'avatar_url']),
                'razorpay_key_id'    => $course->creator->razorpay_account_id ?? config('services.razorpay.key_id'),
            ],
        ]);
    }

    public function createOrder(string $courseId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'       => ['required', 'email'],
            'coupon_code' => ['nullable', 'string'],
        ]);

        $course  = Course::where('id', $courseId)
            ->where('status', 'published')
            ->with('creator')
            ->firstOrFail();
        $creator = $course->creator;

        if ($course->pricing_type === 'free') {
            return response()->json(['status' => 'error', 'message' => 'This course is free.'], 422);
        }

        $amountPaise = $course->price_inr * 100;
        $coupon = null;

        if (!empty($validated['coupon_code'])) {
            $coupon = Coupon::where('code', strtoupper($validated['coupon_code']))
                ->where('creator_id', $creator->id)
                ->where(fn ($q) => $q->whereNull('valid_until')->orWhere('valid_until', '>', now()))
                ->where(fn ($q) => $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses'))
                ->first();

            if (!$coupon) {
                return response()->json(['status' => 'error', 'message' => 'Invalid or expired coupon.'], 422);
            }

            $amountPaise = $coupon->type === 'percent'
                ? (int) ($amountPaise * (1 - $coupon->value / 100))
                : max(0, $amountPaise - ($coupon->value * 100));
        }

        $keyId     = $creator->razorpay_account_id ?? config('services.razorpay.key_id');
        $keySecret = $creator->razorpay_access_token ?? config('services.razorpay.key_secret');

        if (!$keyId || !$keySecret) {
            return response()->json(['status' => 'error', 'message' => 'Payments are not yet enabled for this course.'], 422);
        }

        $response = Http::withBasicAuth($keyId, $keySecret)
            ->post('https://api.razorpay.com/v1/orders', [
                'amount'   => $amountPaise,
                'currency' => 'INR',
                'receipt'  => 'rcpt_' . Str::random(8),
                'notes'    => ['course_id' => $course->id, 'student_email' => $validated['email']],
            ]);

        if (!$response->successful()) {
            return response()->json(['status' => 'error', 'message' => 'Failed to create payment order. Please try again.'], 500);
        }

        $order = $response->json();

        Payment::create([
            'creator_id'      => $creator->id,
            'course_id'       => $course->id,
            'coupon_id'       => $coupon?->id,
            'currency'        => 'INR',
            'base_amount'     => $course->price_inr * 100,
            'discount_amount' => $coupon ? ($course->price_inr * 100 - $amountPaise) : 0,
            'total_amount'    => $amountPaise,
            'gateway'         => 'razorpay',
            'gateway_order_id'=> $order['id'],
            'status'          => 'pending',
            'metadata'        => ['student_email' => $validated['email']],
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'order_id'        => $order['id'],
                'amount'          => $amountPaise,
                'currency'        => 'INR',
                'key_id'          => $keyId,
                'discount_amount' => $coupon ? ($course->price_inr * 100 - $amountPaise) : 0,
            ],
        ]);
    }

    public function verify(string $courseId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'razorpay_order_id'   => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature'  => ['required', 'string'],
            'email'               => ['required', 'email'],
            'name'                => ['nullable', 'string', 'max:255'],
        ]);

        $course  = Course::where('id', $courseId)
            ->where('status', 'published')
            ->with('creator')
            ->firstOrFail();
        $creator = $course->creator;

        $keySecret = $creator->razorpay_access_token ?? config('services.razorpay.key_secret');

        $expected = hash_hmac(
            'sha256',
            $validated['razorpay_order_id'] . '|' . $validated['razorpay_payment_id'],
            $keySecret
        );

        if (!hash_equals($expected, $validated['razorpay_signature'])) {
            return response()->json(['status' => 'error', 'message' => 'Payment verification failed.'], 400);
        }

        return DB::transaction(function () use ($course, $validated) {
            $student = Student::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name'     => $validated['name'] ?? Str::before($validated['email'], '@'),
                    'password' => Hash::make(Str::random(16)),
                ]
            );

            if (!$student->hasRole('student')) {
                $student->assignRole('student');
            }

            $payment = Payment::where('gateway_order_id', $validated['razorpay_order_id'])
                ->where('course_id', $course->id)
                ->first();

            if ($payment) {
                $payment->update([
                    'student_id'         => $student->id,
                    'gateway_payment_id' => $validated['razorpay_payment_id'],
                    'gateway_signature'  => $validated['razorpay_signature'],
                    'status'             => 'captured',
                    'paid_at'            => now(),
                ]);

                if ($payment->coupon_id) {
                    Coupon::where('id', $payment->coupon_id)->increment('used_count');
                    CouponUse::create([
                        'coupon_id'  => $payment->coupon_id,
                        'student_id' => $student->id,
                        'payment_id' => $payment->id,
                        'used_at'    => now(),
                    ]);
                }
            }

            $enrolment = Enrolment::firstOrCreate(
                ['student_id' => $student->id, 'course_id' => $course->id],
                ['status' => 'active', 'source' => 'purchase', 'enrolled_at' => now()]
            );

            $token = $student->createToken('checkout')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'token'        => $token,
                    'student'      => $student->only(['id', 'name', 'email']),
                    'enrolment_id' => $enrolment->id,
                    'course_id'    => $course->id,
                ],
            ]);
        });
    }

    public function enrolFree(string $courseId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'name'  => ['nullable', 'string', 'max:255'],
        ]);

        $course = Course::where('id', $courseId)
            ->where('status', 'published')
            ->where('pricing_type', 'free')
            ->firstOrFail();

        return DB::transaction(function () use ($course, $validated) {
            $student = Student::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name'     => $validated['name'] ?? Str::before($validated['email'], '@'),
                    'password' => Hash::make(Str::random(16)),
                ]
            );

            if (!$student->hasRole('student')) {
                $student->assignRole('student');
            }

            $enrolment = Enrolment::firstOrCreate(
                ['student_id' => $student->id, 'course_id' => $course->id],
                ['status' => 'active', 'source' => 'purchase', 'enrolled_at' => now()]
            );

            $token = $student->createToken('checkout')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'token'        => $token,
                    'student'      => $student->only(['id', 'name', 'email']),
                    'enrolment_id' => $enrolment->id,
                    'course_id'    => $course->id,
                ],
            ]);
        });
    }
}
