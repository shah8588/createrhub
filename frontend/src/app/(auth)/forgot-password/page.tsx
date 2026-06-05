"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import api, { getErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <Card>
        <div className="text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h2 className="mb-2 text-lg font-semibold text-ink">Check your email</h2>
          <p className="text-sm text-muted">
            If an account exists for <strong>{email}</strong>, we've sent a
            password reset link.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-accent hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="mb-2 text-xl font-semibold text-ink">Reset password</h1>
      <p className="mb-6 text-sm text-muted">
        Enter your email and we'll send you a reset link.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Send reset link
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
