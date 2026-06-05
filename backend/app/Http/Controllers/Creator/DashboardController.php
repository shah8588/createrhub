<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Enrolment;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $creator = $request->user();

        $todayRevenue = Payment::where('creator_id', $creator->id)
            ->where('status', 'captured')
            ->whereDate('paid_at', today())
            ->sum('total_amount');

        $monthRevenue = Payment::where('creator_id', $creator->id)
            ->where('status', 'captured')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('total_amount');

        $totalStudents = Enrolment::whereHas('course', fn ($q) => $q->where('creator_id', $creator->id))
            ->distinct('student_id')
            ->count();

        $activeCourses = $creator->courses()->where('status', 'published')->count();

        $recentEnrolments = Enrolment::whereHas('course', fn ($q) => $q->where('creator_id', $creator->id))
            ->with(['student:id,name,email,avatar_url', 'course:id,title,thumbnail_url'])
            ->latest('enrolled_at')
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'kpis' => [
                    'today_revenue'  => $todayRevenue,
                    'month_revenue'  => $monthRevenue,
                    'total_students' => $totalStudents,
                    'active_courses' => $activeCourses,
                ],
                'recent_enrolments' => $recentEnrolments,
            ],
        ]);
    }
}
