import type { Metadata } from "next";

export const metadata: Metadata = { title: "Students" };

export default function StudentsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-paper">Students</h1>
      <p className="text-muted">Student management coming soon.</p>
    </div>
  );
}
