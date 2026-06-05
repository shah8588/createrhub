import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Dashboard" };

// Stat card placeholder — data fetched client-side via react-query
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-paper">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-paper">Overview</h1>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Today's Revenue" value="—" sub="Loading..." />
        <StatCard label="This Month" value="—" sub="Loading..." />
        <StatCard label="Total Students" value="—" />
        <StatCard label="Active Courses" value="—" />
      </div>
    </div>
  );
}
