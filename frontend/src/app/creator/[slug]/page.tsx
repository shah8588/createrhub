import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} | CreatorHub` };
}

export default async function CreatorStorefrontPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-ink">{slug}</h1>
        <p className="mt-4 text-muted">Creator storefront — coming soon.</p>
      </div>
    </main>
  );
}
