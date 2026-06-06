<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Sanctum token auth works automatically via personal_access_tokens.
        // No guard override needed — HasApiTokens on Creator + Student handles it.
    }
}
