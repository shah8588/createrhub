import type { Metadata } from "next";

export const metadata: Metadata = { title: "Website" };

export default function WebsitePage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-paper">Website</h1>
      <p className="text-muted">Page builder coming soon.</p>
    </div>
  );
}
