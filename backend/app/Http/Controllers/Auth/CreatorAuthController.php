<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Creator;
use App\Models\CreatorSetting;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class CreatorAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:creators,email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $slug = Str::slug($validated['name']) . '-' . Str::lower(Str::random(4));

        $creator = Creator::create([...$validated, 'slug' => $slug]);

        CreatorSetting::create(['creator_id' => $creator->id]);
        $creator->assignRole('creator');

        event(new Registered($creator));

        $token = $creator->createToken('auth-token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Account created.',
            'data'    => ['creator' => $creator->load('settings'), 'token' => $token],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $creator = Creator::where('email', $validated['email'])->first();

        if (!$creator || !Hash::check($validated['password'], $creator->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Revoke old tokens to enforce single-session
        $creator->tokens()->where('name', 'auth-token')->delete();

        $token = $creator->createToken('auth-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'data'   => ['creator' => $creator->load('settings'), 'token' => $token],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['status' => 'success', 'message' => 'Logged out']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $request->user()->load('settings'),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::broker('creators')->sendResetLink(['email' => $request->email]);

        return response()->json([
            'status'  => 'success',
            'message' => 'If an account with that email exists, a reset link has been sent.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token'    => ['required'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $status = Password::broker('creators')->reset(
            $validated,
            fn ($creator, $password) => $creator->update(['password' => Hash::make($password)])
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        return response()->json(['status' => 'success', 'message' => 'Password reset successfully.']);
    }

    public function redirectToGoogle(): JsonResponse
    {
        $url = \Laravel\Socialite\Facades\Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json(['status' => 'success', 'data' => ['url' => $url]]);
    }

    public function handleGoogleCallback(Request $request): JsonResponse
    {
        try {
            $googleUser = \Laravel\Socialite\Facades\Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Google authentication failed'], 422);
        }

        $creator = Creator::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name'              => $googleUser->getName(),
                'slug'              => Str::slug($googleUser->getName()) . '-' . Str::lower(Str::random(4)),
                'google_id'         => $googleUser->getId(),
                'avatar_url'        => $googleUser->getAvatar(),
                'email_verified_at' => now(),
            ]
        );

        if (!$creator->hasRole('creator')) {
            $creator->assignRole('creator');
            CreatorSetting::firstOrCreate(['creator_id' => $creator->id]);
        }

        $creator->tokens()->where('name', 'google-auth')->delete();
        $token = $creator->createToken('google-auth')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'data'   => ['creator' => $creator->load('settings'), 'token' => $token],
        ]);
    }
}
