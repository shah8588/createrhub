<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        // General API — 100 req/min per IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(100)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn () => response()->json([
                    'status'  => 'error',
                    'message' => 'Too many requests. Please slow down.',
                ], 429));
        });

        // Auth endpoints — 10 req/min per IP (brute-force protection)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'status'  => 'error',
                    'message' => 'Too many attempts. Please wait before trying again.',
                ], 429));
        });

        // Upload endpoints — 5 req/min per user
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn () => response()->json([
                    'status'  => 'error',
                    'message' => 'Upload limit reached. Please wait before uploading again.',
                ], 429));
        });
    }
}
