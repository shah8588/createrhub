"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, Tag, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  pricing_type: string;
  price_inr: number;
  original_price_inr: number | null;
  creator: { id: string; name: string; slug: string; avatar_url: string | null };
  razorpay_key_id: string | null;
}

type Stage = "form" | "paying" | "success";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export default function CheckoutPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API}/checkout/${courseId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => setCourse(json.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [courseId]);

  // Load Razorpay JS once course is ready
  useEffect(() => {
    if (!course || course.pricing_type === "free") return;
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, [course]);

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim() || !course) return;
    setSubmitting(true);
    setCouponError("");
    try {
      const res = await fetch(`${API}/checkout/${courseId}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || "preview@coupon.test", coupon_code: couponCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCouponError(json.message ?? "Invalid coupon.");
      } else {
        setDiscountAmount(json.data.discount_amount);
        setCouponApplied(true);
      }
    } catch {
      setCouponError("Failed to apply coupon.");
    } finally {
      setSubmitting(false);
    }
  }, [courseId, couponCode, email, course]);

  const handlePay = useCallback(async () => {
    if (!course || !email.trim()) return;
    setError("");
    setSubmitting(true);

    try {
      if (course.pricing_type === "free") {
        const res = await fetch(`${API}/checkout/${courseId}/enrol-free`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Enrolment failed.");
        localStorage.setItem("student_token", json.data.token);
        setStage("success");
        return;
      }

      // Paid course — create Razorpay order
      const orderRes = await fetch(`${API}/checkout/${courseId}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, coupon_code: couponApplied ? couponCode : undefined }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.message ?? "Order creation failed.");

      const { order_id, amount, currency, key_id } = orderJson.data;

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: key_id ?? course.razorpay_key_id,
          amount,
          currency,
          order_id,
          name: course.creator.name,
          description: course.title,
          prefill: { email, name },
          theme: { color: "#c84b31" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch(`${API}/checkout/${courseId}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  email,
                  name,
                }),
              });
              const verifyJson = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyJson.message ?? "Verification failed.");
              localStorage.setItem("student_token", verifyJson.data.token);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
        });
        rzp.open();
      });

      setStage("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }, [course, courseId, email, name, couponCode, couponApplied]);

  const finalPrice = course ? course.price_inr - Math.round(discountAmount / 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-center">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Course not found</h1>
          <p className="mt-2 text-muted">This course may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="w-full max-w-sm rounded-2xl border border-warm bg-white p-10 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-500" />
          <h1 className="text-2xl font-semibold text-ink">You&apos;re enrolled!</h1>
          <p className="mt-2 text-muted">Welcome to <span className="font-medium text-ink">{course.title}</span>.</p>
          <Button className="mt-8 w-full" onClick={() => router.push(`/learn/${courseId}`)}>
            Start Learning
          </Button>
        </div>
      </div>
    );
  }

  const isFree = course.pricing_type === "free";

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Course summary — left */}
          <div className="lg:col-span-3">
            <a
              href={`/creator/${course.creator.slug}`}
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
            >
              {course.creator.avatar_url ? (
                <img src={course.creator.avatar_url} alt={course.creator.name} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {course.creator.name[0]?.toUpperCase()}
                </div>
              )}
              {course.creator.name}
            </a>

            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} className="mb-6 w-full rounded-2xl object-cover shadow-sm" style={{ maxHeight: 280 }} />
            ) : (
              <div className="mb-6 flex aspect-video w-full items-center justify-center rounded-2xl bg-cream">
                <BookOpen className="h-12 w-12 text-muted" />
              </div>
            )}

            <h1 className="font-display text-2xl font-bold text-ink">{course.title}</h1>
            {course.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted">{course.description}</p>
            )}

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-cream px-4 py-3 text-sm text-muted">
              <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
              Secure checkout powered by Razorpay. Your card details are never stored.
            </div>
          </div>

          {/* Checkout form — right */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-warm bg-white p-6 shadow-sm">
              <div className="mb-5 text-center">
                {isFree ? (
                  <p className="text-2xl font-bold text-green-600">Free</p>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-ink">₹{finalPrice.toLocaleString("en-IN")}</p>
                    {course.original_price_inr && course.original_price_inr > course.price_inr && (
                      <p className="text-sm text-muted line-through">₹{course.original_price_inr.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Your name</label>
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Email address *</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {!isFree && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Coupon code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. LAUNCH50"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); setDiscountAmount(0); setCouponError(""); }}
                        disabled={couponApplied}
                        className="flex-1"
                      />
                      <Button
                        variant="secondary"
                        onClick={applyCoupon}
                        disabled={!couponCode.trim() || couponApplied || submitting || !email.trim()}
                        className="shrink-0"
                      >
                        <Tag className="h-3.5 w-3.5 mr-1" />
                        Apply
                      </Button>
                    </div>
                    {couponApplied && (
                      <p className="mt-1 text-xs text-green-600">
                        Coupon applied — you save ₹{Math.round(discountAmount / 100).toLocaleString("en-IN")}
                      </p>
                    )}
                    {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}
                  </div>
                )}

                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

                <Button
                  className="w-full"
                  onClick={handlePay}
                  disabled={!email.trim() || submitting || stage === "paying"}
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                  ) : isFree ? (
                    "Enrol for Free"
                  ) : (
                    `Pay ₹${finalPrice.toLocaleString("en-IN")}`
                  )}
                </Button>

                <p className="text-center text-xs text-muted">
                  By enrolling you agree to the platform&apos;s terms of service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
