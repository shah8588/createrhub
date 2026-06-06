<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function store(Request $request, Course $course): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:1'],
        ]);

        $order = $validated['order'] ?? ($course->modules()->max('order') + 1);
        $module = $course->modules()->create(['title' => $validated['title'], 'order' => $order]);

        return response()->json(['status' => 'success', 'data' => $module], 201);
    }

    public function update(Request $request, Course $course, Module $module): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);
        abort_if($module->course_id !== $course->id, 404);

        $module->update($request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]));

        return response()->json(['status' => 'success', 'data' => $module]);
    }

    public function destroy(Request $request, Course $course, Module $module): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);
        abort_if($module->course_id !== $course->id, 404);

        $module->delete();

        return response()->json(['status' => 'success', 'message' => 'Module deleted']);
    }

    public function reorder(Request $request, Course $course): JsonResponse
    {
        abort_if($course->creator_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'modules'         => ['required', 'array'],
            'modules.*.id'    => ['required', 'uuid'],
            'modules.*.order' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($validated['modules'] as $item) {
            Module::where('id', $item['id'])->where('course_id', $course->id)
                ->update(['order' => $item['order']]);
        }

        return response()->json(['status' => 'success']);
    }
}
