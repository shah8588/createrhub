<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUse;
use App\Models\Course;
use App\Models\Enrolment;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $payments = Payment::where('creator_id', $request->user()->id)
            ->with(['student:id,name,email', 'course:id,title'])
            ->latest()
            ->paginate(50);

        return response()->json(['status' => 'success', 'data' => $payments]);
    }

    public function createRazorpayOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id'   => ['required', 'uuid', 'exists:courses,id'],
            'coupon_code' => ['nullable', 'string'],
        ]);

        $course  = Course::findOrFail($validated['course_id']);
        $creator = $request->user();

        if ($course->pricing_type === 'free') {
            return response()->json(['status' => 'error', 'message' => 'This course is free.'], 422);
        }

        if (!$creator->razorpay_account_id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Connect your Razorpay account in Settings → Payments first.',
            ], 422);
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

        $secret = $creator->razorpay_access_token ?? config('services.razorpay.key_secret');

        $response = Http::withBasicAuth(config('services.razorpay.key_id'), $secret)
            ->post('https://api.razorpay.com/v1/orders', [
                'amount'   => $amountPaise,
                'currency' => 'INR',
                'receipt'  => 'rcpt_' . Str::random(8),
                'notes'    => ['course_id' => $course->id],
            ]);

        if (!$response->successful()) {
            return response()->json(['status' => 'error', 'message' => 'Failed to create payment order.'], 500);
        }

        $order = $response->json();

        $payment = Payment::create([
            'creator_id'       => $creator->id,
            'course_id'        => $course->id,
            'amount'           => $amountPaise,
            'currency'         => 'INR',
            'gateway'          => 'razorpay',
            'gateway_order_id' => $order['id'],
            'status'           => 'pending',
            'coupon_id'        => $coupon?->id,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'order_id'   => $order['id'],
                'amount'     => $amountPaise,
                'currency'   => 'INR',
                'key_id'     => config('services.razorpay.key_id'),
                'payment_id' => $payment->id,
                'course'     => $course->only(['title', 'thumbnail_url']),
            ],
        ]);
    }

    public function verifyRazorpayPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'razorpay_order_id'   => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature'  => ['required', 'string'],
            'student_id'          => ['required', 'uuid', 'exists:students,id'],
        ]);

        $creator = $request->user();
        $secret  = $creator->razorpay_access_token ?? config('services.razorpay.key_secret');

        $expectedSignature = hash_hmac(
            'sha256',
            $validated['razorpay_order_id'] . '|' . $validated['razorpay_payment_id'],
            $secret
        );

        if (!hash_equals($expectedSignature, $validated['razorpay_signature'])) {
            return response()->json(['status' => 'error', 'message' => 'Payment verification failed.'], 422);
        }

        $payment = Payment::where('gateway_order_id', $validated['razorpay_order_id'])->firstOrFail();

        if ($payment->status === 'captured') {
            return response()->json(['status' => 'success', 'message' => 'Already processed.']);
        }

        DB::transaction(function () use ($payment, $validated) {
            $payment->update([
                'gateway_payment_id' => $validated['razorpay_payment_id'],
                'status'             => 'captured',
                'student_id'         => $validated['student_id'],
            ]);

            Enrolment::firstOrCreate(
                ['student_id' => $validated['student_id'], 'course_id' => $payment->course_id],
                ['source' => 'purchase', 'payment_id' => $payment->id]
            );

            if ($payment->coupon_id) {
                Coupon::find($payment->coupon_id)?->increment('used_count');
                CouponUse::create([
                    'coupon_id'  => $payment->coupon_id,
                    'student_id' => $validated['student_id'],
                    'payment_id' => $payment->id,
                ]);
            }
        });

        return response()->json(['status' => 'success', 'message' => 'Payment successful. Enrolled!']);
    }

    public function refund(Request $request, Payment $payment): JsonResponse
    {
        abort_if($payment->creator_id !== $request->user()->id, 403);

        if ($payment->status !== 'captured') {
            return response()->json(['status' => 'error', 'message' => 'Payment cannot be refunded.'], 422);
        }

        $creator = $request->user();
        $secret  = $creator->razorpay_access_token ?? config('services.razorpay.key_secret');

        $response = Http::withBasicAuth(config('services.razorpay.key_id'), $secret)
            ->post("https://api.razorpay.com/v1/payments/{$payment->gateway_payment_id}/refund");

        if (!$response->successful()) {
            return response()->json(['status' => 'error', 'message' => 'Refund failed.'], 500);
        }

        $payment->update(['status' => 'refunded']);

        Enrolment::where('student_id', $payment->student_id)
            ->where('course_id', $payment->course_id)
            ->update(['status' => 'revoked']);

        return response()->json(['status' => 'success', 'message' => 'Refunded successfully.']);
    }

    public function exportGstr1(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to'   => ['required', 'date'],
        ]);

        $payments = Payment::where('creator_id', $request->user()->id)
            ->where('status', 'captured')
            ->whereBetween('created_at', [$validated['from'], $validated['to']])
            ->with(['student:id,name,email', 'course:id,title', 'invoice'])
            ->get();

        return response()->json(['status' => 'success', 'data' => $payments]);
    }
}
