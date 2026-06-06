"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import api, { getErrorMessage } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/creator/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <Card>
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-ink">Invalid link</h2>
          <p className="text-sm text-muted">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm text-accent hover:underline">
            Request a new link
          </Link>
        </div>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <div className="text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h2 className="mb-2 text-lg font-semibold text-ink">Password updated</h2>
          <p className="text-sm text-muted">Redirecting you to sign in…</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="mb-2 text-xl font-semibold text-ink">Set new password</h1>
      <p className="mb-6 text-sm text-muted">Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <Input
          label="Confirm password"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Reset password
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
