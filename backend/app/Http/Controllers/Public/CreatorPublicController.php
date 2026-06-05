<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Creator;
use Illuminate\Http\JsonResponse;

class CreatorPublicController extends Controller
{
    private function findCreator(string $slug): Creator
    {
        return Creator::where('slug', $slug)->firstOrFail();
    }

    public function profile(string $slug): JsonResponse
    {
        $creator = $this->findCreator($slug);
        return response()->json([
            'status' => 'success',
            'data'   => [
                'creator'     => $creator->only(['id', 'name', 'slug', 'bio', 'avatar_url', 'youtube_url', 'instagram_handle', 'twitter_handle']),
                'settings'    => $creator->settings?->only(['primary_color', 'secondary_color', 'font_family', 'logo_url']),
                'storefront_url' => $creator->storefront_url,
            ],
        ]);
    }

    public function courses(string $slug): JsonResponse
    {
        $creator = $this->findCreator($slug);
        $courses = $creator->courses()
            ->where('status', 'published')
            ->withCount('enrolments')
            ->withAvg('reviews as avg_rating', 'rating')
            ->withCount('reviews')
            ->get(['id', 'title', 'slug', 'description', 'thumbnail_url', 'pricing_type', 'price_inr', 'original_price_inr', 'language']);

        return response()->json(['status' => 'success', 'data' => $courses]);
    }

    public function course(string $slug, string $courseSlug): JsonResponse
    {
        $creator = $this->findCreator($slug);
        $course = $creator->courses()
            ->where('slug', $courseSlug)
            ->where('status', 'published')
            ->with(['modules.lessons' => fn ($q) => $q->select(['id', 'module_id', 'title', 'content_type', 'duration_seconds', 'is_free_preview', 'order'])])
            ->withAvg('reviews as avg_rating', 'rating')
            ->withCount(['reviews', 'enrolments'])
            ->firstOrFail();

        $reviews = $course->reviews()
            ->where('is_hidden', false)
            ->with('student:id,name,avatar_url')
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json(['status' => 'success', 'data' => compact('course', 'reviews')]);
    }

    public function blog(string $slug): JsonResponse
    {
        $creator = $this->findCreator($slug);
        $posts = $creator->hasMany(\App\Models\BlogPost::class)
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate(10, ['id', 'title', 'slug', 'excerpt', 'featured_image_url', 'category', 'published_at', 'reading_time_minutes']);

        return response()->json(['status' => 'success', 'data' => $posts]);
    }

    public function post(string $slug, string $postSlug): JsonResponse
    {
        $creator = $this->findCreator($slug);
        $post = $creator->hasMany(\App\Models\BlogPost::class)
            ->where('slug', $postSlug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json(['status' => 'success', 'data' => $post]);
    }

    public function page(string $slug, string $pageSlug): JsonResponse
    {
        $creator = $this->findCreator($slug);
        $page = $creator->pages()
            ->where('slug', $pageSlug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json(['status' => 'success', 'data' => $page]);
    }
}
