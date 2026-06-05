<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RazorpayWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        // Verify webhook signature
        $webhookSecret = config('services.razorpay.key_secret');
        $signature     = $request->header('X-Razorpay-Signature');
        $expectedSig   = hash_hmac('sha256', $request->getContent(), $webhookSecret);

        if (!hash_equals($expectedSig, (string) $signature)) {
            Log::warning('Razorpay webhook signature mismatch');
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 400);
        }

        $event   = $request->input('event');
        $payload = $request->input('payload');

        match ($event) {
            'payment.captured' => $this->handlePaymentCaptured($payload),
            'payment.failed'   => $this->handlePaymentFailed($payload),
            default            => Log::info('Unhandled Razorpay event: ' . $event),
        };

        return response()->json(['status' => 'success']);
    }

    private function handlePaymentCaptured(array $payload): void
    {
        $gatewayPaymentId = $payload['payment']['entity']['id'] ?? null;
        if (!$gatewayPaymentId) return;

        $payment = Payment::where('gateway_payment_id', $gatewayPaymentId)->first();
        if (!$payment || $payment->status === 'captured') return;

        $payment->update(['status' => 'captured', 'paid_at' => now()]);

        // Trigger enrolment + invoice generation
        // TODO: dispatch(new \App\Jobs\FulfillPayment($payment));
    }

    private function handlePaymentFailed(array $payload): void
    {
        $gatewayPaymentId = $payload['payment']['entity']['id'] ?? null;
        if (!$gatewayPaymentId) return;

        Payment::where('gateway_payment_id', $gatewayPaymentId)
            ->update(['status' => 'failed']);
    }
}
