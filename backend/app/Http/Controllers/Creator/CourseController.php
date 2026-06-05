<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CreatorSetting;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courses = $request->user()->courses()
            ->withCount(['enrolments', 'lessons'])
            ->withSum(['payments as revenue' => fn ($q) => $q->where('status', 'captured')], 'total_amount')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json(['status' => 'success', 'data' => $courses]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'category'     => ['nullable', 'string'],
            'language'     => ['nullable', 'string', 'size:2'],
            'pricing_type' => ['nullable', 'in:free,one_time,subscription,payment_plan'],
            'price_inr'    => ['nullable', 'integer', 'min:0'],
        ]);

        $creator = $request->user();
        $slug    = Str::slug($validated['title']) . '-' . Str::lower(Str::random(4));

        $course = $creator->courses()->create([...$validated, 'slug' => $slug]);

        // Auto-create a sales page skeleton
        $settings = $creator->settings ?? CreatorSetting::create(['creator_id' => $creator->id]);
        Page::create([
            'creator_id' => $creator->id,
            'slug'       => 'courses/' . $slug,
            'title'      => $course->title,
            'type'       => 'course',
            'status'     => 'draft',
            'blocks'     => [
                ['type' => 'course-hero', 'props' => ['course_id' => $course->id]],
                ['type' => 'course-curriculum', 'props' => ['course_id' => $course->id]],
                ['type' => 'course-pricing', 'props' => ['course_id' => $course->id]],
                ['type' => 'creator-bio', 'props' => ['creator_id' => $creator->id]],
            ],
        ]);

        return response()->json(['status' => 'success', 'data' => $course], 201);
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        $this->authorise($request, $course);
        return response()->json([
            'status' => 'success',
            'data'   => $course->load(['modules.lessons', 'certificateTemplate']),
        ]);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $this->authorise($request, $course);
        $course->update($request->validate([
            'title'        => ['sometimes', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'thumbnail_url'=> ['nullable', 'url'],
            'category'     => ['nullable', 'string'],
            'language'     => ['nullable', 'string'],
            'pricing_type' => ['nullable', 'in:free,one_time,subscription,payment_plan'],
            'price_inr'    => ['nullable', 'integer', 'min:0'],
            'access_days'  => ['nullable', 'integer', 'min:1'],
            'certificate_enabled' => ['boolean'],
            'community_enabled'   => ['boolean'],
            'meta_title'          => ['nullable', 'string', 'max:70'],
            'meta_description'    => ['nullable', 'string', 'max:160'],
        ]));

        return response()->json(['status' => 'success', 'data' => $course]);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $this->authorise($request, $course);
        $course->delete();
        return response()->json(['status' => 'success', 'message' => 'Course deleted']);
    }

    public function publish(Request $request, Course $course): JsonResponse
    {
        $this->authorise($request, $course);
        $course->update(['status' => 'published', 'published_at' => now()]);
        return response()->json(['status' => 'success', 'data' => $course]);
    }

    public function archive(Request $request, Course $course): JsonResponse
    {
        $this->authorise($request, $course);
        $course->update(['status' => 'archived']);
        return response()->json(['status' => 'success', 'data' => $course]);
    }

    private function authorise(Request $request, Course $course): void
    {
        abort_if($course->creator_id !== $request->user()->id, 403, 'Forbidden');
    }
}
