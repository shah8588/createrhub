import type { Metadata } from "next";
import Link from "next/link";
import { Youtube, Instagram, Twitter, BookOpen, Users, Star } from "lucide-react";

interface Creator {
  id: string; name: string; slug: string; bio: string | null;
  avatar_url: string | null; youtube_url: string | null;
  instagram_handle: string | null; twitter_handle: string | null;
}
interface Course {
  id: string; title: string; slug: string; description: string | null;
  thumbnail_url: string | null; pricing_type: string; price_inr: number;
  enrolments_count: number; avg_rating: number | null; reviews_count: number;
}
interface Props { params: Promise<{ slug: string }> }

async function fetchProfile(slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
    const [pr, cr] = await Promise.all([
      fetch(`${base}/c/${slug}`, { next: { revalidate: 300 } }),
      fetch(`${base}/c/${slug}/courses`, { next: { revalidate: 300 } }),
    ]);
    if (!pr.ok) return null;
    const p = await pr.json();
    const c = cr.ok ? await cr.json() : { data: [] };
    return { creator: p.data.creator as Creator, settings: p.data.settings, courses: c.data as Course[] };
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await fetchProfile(slug);
  if (!d) return { title: `${slug} | CreatorHub` };
  return { title: `${d.creator.name} | CreatorHub`, description: d.creator.bio ?? `Courses by ${d.creator.name}` };
}

export default async function CreatorStorefrontPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchProfile(slug);

  if (!data) return (
    <main className="flex min-h-screen items-center justify-center bg-paper">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">Creator not found</h1>
        <p className="mt-2 text-muted">This page does not exist or has been removed.</p>
      </div>
    </main>
  );

  const { creator, settings, courses } = data;
  const accent: string = (settings as { primary_color?: string } | null)?.primary_color ?? "#c84b31";

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-warm bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.name} className="h-24 w-24 shrink-0 rounded-full object-cover shadow-md" />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white shadow-md" style={{ backgroundColor: accent }}>
                {creator.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl font-bold text-ink">{creator.name}</h1>
              {creator.bio && <p className="mt-2 max-w-lg text-muted">{creator.bio}</p>}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                {creator.youtube_url && (
                  <a href={creator.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                    <Youtube className="h-4 w-4" /> YouTube
                  </a>
                )}
                {creator.instagram_handle && (
                  <a href={`https://instagram.com/${creator.instagram_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                    <Instagram className="h-4 w-4" /> {creator.instagram_handle}
                  </a>
                )}
                {creator.twitter_handle && (
                  <a href={`https://x.com/${creator.twitter_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                    <Twitter className="h-4 w-4" /> {creator.twitter_handle}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold text-ink">Courses</h2>
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-warm py-16 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-muted" />
            <p className="text-muted">No published courses yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/checkout/${course.id}`} className="group overflow-hidden rounded-2xl border border-warm bg-white shadow-sm transition hover:shadow-md">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center" style={{ backgroundColor: accent + "18" }}>
                    <BookOpen className="h-10 w-10" style={{ color: accent }} />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold text-ink group-hover:text-accent">{course.title}</h3>
                  {course.description && <p className="mt-1 line-clamp-2 text-xs text-muted">{course.description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrolments_count}</span>
                      {course.avg_rating && (
                        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {course.avg_rating.toFixed(1)}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-ink">
                      {course.pricing_type === "free" ? "Free" : `₹${course.price_inr.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
