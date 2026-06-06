<?php

use App\Http\Controllers\Auth\CreatorAuthController;
use App\Http\Controllers\Auth\StudentAuthController;
use App\Http\Controllers\Creator\CourseController;
use App\Http\Controllers\Creator\DashboardController;
use App\Http\Controllers\Creator\LessonController;
use App\Http\Controllers\Creator\ModuleController;
use App\Http\Controllers\Creator\PaymentController as CreatorPaymentController;
use App\Http\Controllers\Creator\StudentCrmController;
use App\Http\Controllers\Creator\QaController as CreatorQaController;
use App\Http\Controllers\Creator\ReviewController as CreatorReviewController;
use App\Http\Controllers\Creator\SettingsController;
use App\Http\Controllers\Creator\WebsiteController;
use App\Http\Controllers\Student\EnrolmentController;
use App\Http\Controllers\Student\LearningController;
use App\Http\Controllers\Student\QaController as StudentQaController;
use App\Http\Controllers\Public\CreatorPublicController;
use App\Http\Controllers\Webhook\RazorpayWebhookController;
use App\Http\Controllers\Webhook\MuxWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ─── Health check ──────────────────────────────────────────────────────────────
Route::get('/health', fn () => response()->json(['status' => 'ok', 'timestamp' => now()]));

// ─── Public routes ─────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Creator Auth — also aliased at /auth/login for frontend convenience
    Route::prefix('auth/creator')->group(function () {
        Route::post('register', [CreatorAuthController::class, 'register']);
        Route::post('login', [CreatorAuthController::class, 'login']);
        Route::post('forgot-password', [CreatorAuthController::class, 'forgotPassword']);
        Route::post('reset-password', [CreatorAuthController::class, 'resetPassword']);
        Route::get('google', [CreatorAuthController::class, 'redirectToGoogle']);
        Route::get('google/callback', [CreatorAuthController::class, 'handleGoogleCallback']);
    });
    // Short aliases used by the frontend
    Route::post('auth/register', [CreatorAuthController::class, 'register']);
    Route::post('auth/login',    [CreatorAuthController::class, 'login']);
    Route::post('auth/forgot-password', [CreatorAuthController::class, 'forgotPassword']);
    Route::post('auth/logout', [CreatorAuthController::class, 'logout'])->middleware('auth:sanctum');

    // Student Auth
    Route::prefix('auth/student')->group(function () {
        Route::post('send-otp', [StudentAuthController::class, 'sendOtp']);
        Route::post('verify-otp', [StudentAuthController::class, 'verifyOtp']);
        Route::post('logout', [StudentAuthController::class, 'logout'])->middleware('auth:sanctum');
    });

    // Public creator profiles & storefronts
    Route::prefix('c/{slug}')->group(function () {
        Route::get('/', [CreatorPublicController::class, 'profile']);
        Route::get('courses', [CreatorPublicController::class, 'courses']);
        Route::get('courses/{courseSlug}', [CreatorPublicController::class, 'course']);
        Route::get('blog', [CreatorPublicController::class, 'blog']);
        Route::get('blog/{postSlug}', [CreatorPublicController::class, 'post']);
        Route::get('page/{pageSlug}', [CreatorPublicController::class, 'page']);
    });

    // Certificate verification (public)
    Route::get('verify/{code}', fn ($code) => response()->json(
        \App\Models\Certificate::where('verify_code', $code)
            ->with(['student:id,name', 'course:id,title,creator_id', 'course.creator:id,name'])
            ->firstOrFail()
    ));

    // Webhooks (signature-verified, NOT Sanctum-protected)
    Route::prefix('webhooks')->group(function () {
        Route::post('razorpay', [RazorpayWebhookController::class, 'handle']);
        Route::post('mux', [MuxWebhookController::class, 'handle']);
    });

    // ─── Creator protected routes ────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'role:creator'])
        ->prefix('creator')
        ->group(function () {

        Route::get('me', [CreatorAuthController::class, 'me']);
        Route::post('auth/logout', [CreatorAuthController::class, 'logout']);

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Courses
        Route::apiResource('courses', CourseController::class);
        Route::patch('courses/{course}/publish', [CourseController::class, 'publish']);
        Route::patch('courses/{course}/archive', [CourseController::class, 'archive']);

        // Modules & Lessons (nested under course)
        Route::prefix('courses/{course}')->group(function () {
            // Modules
            Route::post('modules', [ModuleController::class, 'store']);
            Route::patch('modules/{module}', [ModuleController::class, 'update']);
            Route::delete('modules/{module}', [ModuleController::class, 'destroy']);
            Route::post('modules/reorder', [ModuleController::class, 'reorder']);

            // Lessons
            Route::apiResource('lessons', LessonController::class)->except(['index']);
            Route::get('lessons', [LessonController::class, 'index']);
            Route::post('lessons/{lesson}/mux-upload-url', [LessonController::class, 'getMuxUploadUrl']);
            Route::patch('lessons/reorder', [LessonController::class, 'reorder']);
        });

        // Students CRM
        Route::get('students', [StudentCrmController::class, 'index']);
        Route::get('students/{student}', [StudentCrmController::class, 'show']);
        Route::post('students/{student}/enrol', [StudentCrmController::class, 'enrol']);
        Route::post('students/bulk-enrol', [StudentCrmController::class, 'bulkEnrol']);
        Route::patch('students/{student}/revoke/{course}', [StudentCrmController::class, 'revoke']);

        // Payments & Invoices
        Route::get('payments', [CreatorPaymentController::class, 'index']);
        Route::post('payments/razorpay/create-order', [CreatorPaymentController::class, 'createRazorpayOrder']);
        Route::post('payments/razorpay/verify', [CreatorPaymentController::class, 'verifyRazorpayPayment']);
        Route::post('payments/{payment}/refund', [CreatorPaymentController::class, 'refund']);
        Route::get('payments/export/gstr1', [CreatorPaymentController::class, 'exportGstr1']);

        // Q&A
        Route::get('qa', [CreatorQaController::class, 'index']);
        Route::post('qa/{question}/answer', [CreatorQaController::class, 'answer']);
        Route::patch('qa/{question}/resolve', [CreatorQaController::class, 'resolve']);

        // Reviews
        Route::get('reviews', [CreatorReviewController::class, 'index']);
        Route::post('reviews/{review}/reply', [CreatorReviewController::class, 'reply']);
        Route::patch('reviews/{review}/feature', [CreatorReviewController::class, 'feature']);

        // Website & Pages
        Route::apiResource('pages', WebsiteController::class);
        Route::patch('pages/{page}/publish', [WebsiteController::class, 'publish']);

        // Settings
        Route::get('settings', [SettingsController::class, 'show']);
        Route::patch('settings', [SettingsController::class, 'update']);
        Route::post('settings/change-password', [SettingsController::class, 'changePassword']);
        Route::post('settings/domain/verify', [SettingsController::class, 'verifyDomain']);
    });

    // ─── Student protected routes ────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'role:student'])
        ->prefix('student')
        ->group(function () {

        Route::get('me', fn (Request $req) => response()->json(['data' => $req->user()]));

        // Enrolments
        Route::get('enrolments', [EnrolmentController::class, 'index']);
        Route::get('enrolments/{course}', [EnrolmentController::class, 'show']);

        // Learning
        Route::get('courses/{course}/lessons', [LearningController::class, 'curriculum']);
        Route::get('courses/{course}/lessons/{lesson}', [LearningController::class, 'lesson']);
        Route::post('lessons/{lesson}/complete', [LearningController::class, 'markComplete']);
        Route::post('lessons/{lesson}/progress', [LearningController::class, 'saveProgress']);

        // Q&A
        Route::post('lessons/{lesson}/qa', [StudentQaController::class, 'store']);
        Route::get('lessons/{lesson}/qa', [StudentQaController::class, 'index']);
        Route::post('qa/{question}/upvote', [StudentQaController::class, 'upvote']);

        // Reviews
        Route::post('courses/{course}/review', [\App\Http\Controllers\Student\ReviewController::class, 'store']);

        // Certificates
        Route::get('certificates', [\App\Http\Controllers\Student\CertificateController::class, 'index']);
    });
});
