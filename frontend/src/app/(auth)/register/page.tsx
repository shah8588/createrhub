"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { creatorRegister } from "@/lib/auth";
import { getErrorMessage, getFieldErrors } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    try {
      await creatorRegister(form);
      toast.success("Account created! Welcome to CreatorHub.");
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
      <h1 className="mb-6 text-xl font-semibold text-ink">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          value={form.name}
          onChange={set("name")}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          autoComplete="new-password"
          required
        />
        <Input
          label="Confirm password"
          type="password"
          value={form.password_confirmation}
          onChange={set("password_confirmation")}
          error={errors.password_confirmation}
          autoComplete="new-password"
          required
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create account
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
