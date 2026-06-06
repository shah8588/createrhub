<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LessonController extends Controller
{
    public function index(Request $request, Course $course): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);
        return response()->json([
            'status' => 'success',
            'data'   => $course->load('modules.lessons'),
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'module_id'       => ['required', 'uuid', 'exists:modules,id'],
            'title'           => ['required', 'string', 'max:255'],
            'content_type'    => ['required', 'in:video,text,file,quiz'],
            'content'         => ['nullable', 'string'],
            'is_free_preview' => ['boolean'],
            'order'           => ['nullable', 'integer', 'min:1'],
        ]);

        $lesson = Lesson::create([
            ...$validated,
            'course_id'    => $course->id,
            'video_status' => $validated['content_type'] === 'video' ? 'pending' : null,
        ]);

        return response()->json(['status' => 'success', 'data' => $lesson], 201);
    }

    public function show(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);
        return response()->json(['status' => 'success', 'data' => $lesson]);
    }

    public function update(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);
        $lesson->update($request->validate([
            'title'           => ['sometimes', 'string', 'max:255'],
            'content'         => ['nullable', 'string'],
            'is_free_preview' => ['boolean'],
            'order'           => ['nullable', 'integer', 'min:1'],
        ]));
        return response()->json(['status' => 'success', 'data' => $lesson]);
    }

    public function destroy(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);
        $lesson->delete();
        return response()->json(['status' => 'success', 'message' => 'Lesson deleted']);
    }

    public function getMuxUploadUrl(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);
        // TODO: Mux direct upload URL generation
        return response()->json(['status' => 'error', 'message' => 'Mux not configured'], 501);
    }

    public function reorder(Request $request, Course $course): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);
        $validated = $request->validate([
            'lessons'         => ['required', 'array'],
            'lessons.*.id'    => ['required', 'uuid'],
            'lessons.*.order' => ['required', 'integer', 'min:1'],
        ]);
        foreach ($validated['lessons'] as $item) {
            Lesson::where('id', $item['id'])->where('course_id', $course->id)
                ->update(['order' => $item['order']]);
        }
        return response()->json(['status' => 'success']);
    }
}
