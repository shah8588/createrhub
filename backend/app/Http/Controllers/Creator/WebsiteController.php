<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class WebsiteController extends Controller
{
    public function __call($name, $args): JsonResponse
    {
        return response()->json(['status' => 'success', 'message' => 'Not yet implemented', 'action' => $name]);
    }
}
