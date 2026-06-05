import type { Metadata } from "next";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-paper">Courses</h1>
      </div>
      <p className="text-muted">Course management coming soon.</p>
    </div>
  );
}
