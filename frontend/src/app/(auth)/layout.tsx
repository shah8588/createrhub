import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold text-ink">
            CreatorHub
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
