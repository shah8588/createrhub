<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentOtpCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class StudentAuthController extends Controller
{
    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string'],  // email or phone
            'type'       => ['required', 'in:email_otp,whatsapp_otp'],
        ]);

        $key = 'otp:' . $validated['identifier'];

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Too many OTP requests. Please wait before trying again.',
            ], 429);
        }

        RateLimiter::hit($key, 600); // 10-minute window

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        StudentOtpCode::create([
            'identifier' => $validated['identifier'],
            'type'       => $validated['type'],
            'code'       => bcrypt($code),  // store hashed
            'expires_at' => now()->addMinutes(10),
        ]);

        // TODO: Send via email or WhatsApp based on type
        // In dev: just return the code (never in production)
        $devCode = app()->environment('local') ? $code : null;

        return response()->json([
            'status'  => 'success',
            'message' => 'OTP sent successfully',
            'data'    => ['dev_code' => $devCode],
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string'],
            'code'       => ['required', 'string', 'size:6'],
            'name'       => ['nullable', 'string', 'max:255'],
        ]);

        $otpRecord = StudentOtpCode::where('identifier', $validated['identifier'])
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->orderByDesc('created_at')
            ->first();

        if (!$otpRecord || !\Hash::check($validated['code'], $otpRecord->code)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid or expired OTP',
            ], 422);
        }

        $otpRecord->update(['used_at' => now()]);

        // Auto-create student if first login
        $student = Student::firstOrCreate(
            ['email' => $validated['identifier']],
            [
                'name'              => $validated['name'] ?? 'Student',
                'email_verified_at' => now(),
            ]
        );

        if (!$student->hasRole('student')) {
            $student->assignRole('student');
        }

        $token = $student->createToken('otp-auth')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'data'   => ['student' => $student, 'token' => $token],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['status' => 'success', 'message' => 'Logged out']);
    }
}
