<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MuxWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        // Verify Mux webhook signature
        $secret    = config('services.mux.webhook_secret');
        $signature = $request->header('Mux-Signature');
        $body      = $request->getContent();

        if (!$this->verifySignature($body, $signature, $secret)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 400);
        }

        $type = $request->input('type');
        $data = $request->input('data');

        match ($type) {
            'video.asset.ready'   => $this->handleAssetReady($data),
            'video.asset.errored' => $this->handleAssetErrored($data),
            default               => Log::info('Unhandled Mux event: ' . $type),
        };

        return response()->json(['status' => 'success']);
    }

    private function handleAssetReady(array $data): void
    {
        $assetId    = $data['id'] ?? null;
        $playbackId = $data['playback_ids'][0]['id'] ?? null;
        $duration   = (int) ($data['duration'] ?? 0);

        if (!$assetId) return;

        Lesson::where('mux_asset_id', $assetId)->update([
            'mux_playback_id' => $playbackId,
            'duration_seconds' => $duration,
            'video_status'    => 'ready',
        ]);
    }

    private function handleAssetErrored(array $data): void
    {
        $assetId = $data['id'] ?? null;
        if (!$assetId) return;

        Lesson::where('mux_asset_id', $assetId)->update(['video_status' => 'error']);
    }

    private function verifySignature(string $body, ?string $signature, string $secret): bool
    {
        if (!$signature) return false;

        // Mux signature format: t=timestamp,v1=hash
        preg_match('/t=(\d+),v1=(.+)/', $signature, $matches);
        if (!isset($matches[1], $matches[2])) return false;

        $expected = hash_hmac('sha256', $matches[1] . '.' . $body, $secret);
        return hash_equals($expected, $matches[2]);
    }
}
