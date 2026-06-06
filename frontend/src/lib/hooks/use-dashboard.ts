import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface DashboardKpis {
  today_revenue: number;
  month_revenue: number;
  total_students: number;
  active_courses: number;
}

interface RecentEnrolment {
  id: string;
  enrolled_at: string;
  source: string;
  student: { id: string; name: string; email: string; avatar_url: string | null };
  course: { id: string; title: string; thumbnail_url: string | null };
}

export interface DashboardData {
  kpis: DashboardKpis;
  recent_enrolments: RecentEnrolment[];
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardData> => {
      const { data } = await api.get("/creator/dashboard");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function formatKpiRevenue(paise: number): string {
  return formatCurrency(paise);
}
