import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <h1 className="font-display text-5xl font-bold text-ink sm:text-6xl">
        CreatorHub
      </h1>
      <p className="mt-4 max-w-md text-center text-lg text-muted">
        The all-in-one platform for Indian course creators — sell courses, manage
        students, and grow your audience.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/register">
          <Button size="lg">Get started free</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">Sign in</Button>
        </Link>
      </div>
    </main>
  );
}
