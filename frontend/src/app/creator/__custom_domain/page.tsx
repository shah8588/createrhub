import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "CreatorHub" };

export default async function CustomDomainPage() {
  const headerList = await headers();
  const domain = headerList.get("x-custom-domain") ?? "";

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-ink">{domain}</h1>
        <p className="mt-4 text-muted">Custom domain storefront — coming soon.</p>
      </div>
    </main>
  );
}
