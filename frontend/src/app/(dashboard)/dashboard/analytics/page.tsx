import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-paper">Analytics</h1>
      <p className="text-muted">Analytics coming soon.</p>
    </div>
  );
}
