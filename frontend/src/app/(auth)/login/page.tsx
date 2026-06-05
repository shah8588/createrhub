"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { creatorLogin } from "@/lib/auth";
import { getErrorMessage, getFieldErrors } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    try {
      await creatorLogin(email, password);
      router.push("/dashboard");
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(fieldErrors)) {
          flat[key] = msgs[0];
        }
        setErrors(flat);
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="mb-6 text-xl font-semibold text-ink">Welcome back</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          required
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        New to CreatorHub?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create account
        </Link>
      </p>
    </Card>
  );
}
