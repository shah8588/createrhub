import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-paper">Payments</h1>
      <p className="text-muted">Payment history coming soon.</p>
    </div>
  );
}
