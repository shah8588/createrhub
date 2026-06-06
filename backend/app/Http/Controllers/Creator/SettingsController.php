<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password as PasswordRule;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $request->user()->load('settings'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $creator = $request->user();

        $profileFields = $request->validate([
            'name'             => ['sometimes', 'string', 'max:255'],
            'bio'              => ['nullable', 'string', 'max:500'],
            'phone'            => ['nullable', 'string', 'max:20'],
            'youtube_url'      => ['nullable', 'url'],
            'instagram_handle' => ['nullable', 'string', 'max:100'],
            'twitter_handle'   => ['nullable', 'string', 'max:100'],
            'website_url'      => ['nullable', 'url'],
            'gstin'            => ['nullable', 'string', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/'],
            'business_name'    => ['nullable', 'string', 'max:255'],
            'business_address' => ['nullable', 'string', 'max:500'],
            'state_code'       => ['nullable', 'string', 'size:2'],
        ]);

        $brandingFields = $request->validate([
            'primary_color'   => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'secondary_color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'font_family'     => ['nullable', 'string', 'max:100'],
            'invoice_prefix'  => ['nullable', 'string', 'max:10'],
        ]);

        if (!empty($profileFields)) {
            $creator->update($profileFields);
        }

        if (!empty($brandingFields)) {
            $creator->settings()->update($brandingFields);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $creator->fresh()->load('settings'),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        if (!Hash::check($validated['current_password'], $request->user()->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $request->user()->update(['password' => Hash::make($validated['password'])]);
        $request->user()->tokens()->where('name', 'auth-token')->delete();

        return response()->json(['status' => 'success', 'message' => 'Password updated. Please log in again.']);
    }

    public function verifyDomain(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'domain' => ['required', 'string', 'max:255'],
        ]);

        $domain = strtolower(trim($validated['domain']));
        $cname  = dns_get_record($domain, DNS_CNAME);
        $target = config('platform.domain');

        $verified = collect($cname)->contains(
            fn ($r) => str_ends_with(rtrim($r['target'], '.'), $target)
        );

        $request->user()->settings()->update([
            'custom_domain'      => $domain,
            'domain_status'      => $verified ? 'active' : 'pending',
            'domain_verified_at' => $verified ? now() : null,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'domain'   => $domain,
                'verified' => $verified,
                'cname_target' => 'creators.' . $target,
            ],
        ]);
    }
}
