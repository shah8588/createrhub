"use client";

import { useDashboard, formatKpiRevenue } from "@/lib/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { TrendingUp, Users, BookOpen, IndianRupee } from "lucide-react";

function KpiCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <div className="rounded-lg bg-surface-2 p-2">
          <Icon className="h-4 w-4 text-accent" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-24 bg-surface-2" />
      ) : (
        <p className="mt-3 text-2xl font-semibold text-paper">{value}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const kpis = [
    {
      label: "Today's Revenue",
      value: data ? formatKpiRevenue(data.kpis.today_revenue) : "—",
      icon: IndianRupee,
    },
    {
      label: "This Month",
      value: data ? formatKpiRevenue(data.kpis.month_revenue) : "—",
      icon: TrendingUp,
    },
    {
      label: "Total Students",
      value: data ? String(data.kpis.total_students) : "—",
      icon: Users,
    },
    {
      label: "Active Courses",
      value: data ? String(data.kpis.active_courses) : "—",
      icon: BookOpen,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-paper">Overview</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} loading={isLoading} />
        ))}
      </div>

      {/* Recent Enrolments */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Recent Enrolments
        </h2>
        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 bg-surface-2" />
              ))}
            </div>
          ) : !data?.recent_enrolments?.length ? (
            <p className="p-6 text-sm text-muted">No enrolments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_enrolments.map((e) => (
                  <tr key={e.id} className="border-b border-surface-border last:border-0 hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-paper">{e.student.name}</p>
                        <p className="text-xs text-muted">{e.student.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-paper">{e.course.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={e.source === "purchase" ? "success" : "info"}>
                        {e.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(e.enrolled_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
