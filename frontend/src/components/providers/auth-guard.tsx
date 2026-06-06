"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import { isAuthenticated } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (isError) {
      router.replace("/login");
    }
  }, [isError, router]);

  if (isLoading || (!user && !isError)) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner size="lg" className="text-accent" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
