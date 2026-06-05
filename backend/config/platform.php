<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Platform Domain
    |--------------------------------------------------------------------------
    | The root domain for the platform. Creators get {slug}.PLATFORM_DOMAIN
    | as their default storefront URL, e.g. rahul.createrhub.in
    |
    */
    'domain' => env('PLATFORM_DOMAIN', 'createrhub.in'),

    /*
    |--------------------------------------------------------------------------
    | Subscription Plans
    |--------------------------------------------------------------------------
    */
    'plans' => [
        'free' => [
            'name' => 'Free',
            'max_courses' => 1,
            'max_students' => 25,
            'storage_gb' => 1,
            'platform_fee_percent' => 5.0,
            'features' => ['course_builder', 'website'],
        ],
        'starter' => [
            'name' => 'Starter',
            'price_inr' => 1999,
            'max_courses' => 5,
            'max_students' => 500,
            'storage_gb' => 10,
            'platform_fee_percent' => 2.0,
            'features' => ['course_builder', 'website', 'email', 'community'],
        ],
        'pro' => [
            'name' => 'Pro',
            'price_inr' => 4999,
            'max_courses' => null,   // unlimited
            'max_students' => null,
            'storage_gb' => 100,
            'platform_fee_percent' => 0.0,
            'features' => ['course_builder', 'website', 'email', 'community', 'affiliates', 'ai', 'mobile_app'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | GST Configuration
    |--------------------------------------------------------------------------
    | Platform's own GST registration for subscription fees
    |
    */
    'gst' => [
        'rate' => 18.0,   // 18% GST on digital services in India
        'platform_gstin' => env('PLATFORM_GSTIN', ''),
        'platform_state_code' => env('PLATFORM_STATE_CODE', '27'),  // Maharashtra = 27
    ],

];
