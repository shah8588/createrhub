<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class LearningController extends Controller
{
    public function __call($name, $args): JsonResponse
    {
        return response()->json(['status' => 'success', 'message' => 'Not yet implemented', 'action' => $name]);
    }
}
