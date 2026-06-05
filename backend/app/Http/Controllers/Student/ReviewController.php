<?php
namespace App\Http\Controllers$(echo Student | sed 's/\//\/g');
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
class ReviewController extends Controller
{
    public function __call($name, $args): JsonResponse
    {
        return response()->json(['status' => 'success', 'message' => 'Not yet implemented', 'action' => $name]);
    }
}
