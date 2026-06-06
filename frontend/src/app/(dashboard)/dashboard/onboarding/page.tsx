"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, User, CreditCard, BookOpen, Globe, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { useCreateCourse } from "@/lib/hooks/use-courses";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Profile", icon: User },
  { id: 2, label: "Payments", icon: CreditCard },
  { id: 3, label: "First Course", icon: BookOpen },
  { id: 4, label: "Website", icon: Globe },
  { id: 5, label: "Domain", icon: LinkIcon },
];

function inputClass(extra?: string) {
  return cn(
    "w-full rounded-lg border border-warm bg-cream px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50",
    extra
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: creator } = useSettings();
  const updateSettings = useUpdateSettings();
  const createCourse = useCreateCourse();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(creator?.name ?? "");
  const [bio, setBio] = useState(creator?.bio ?? "");
  const [phone, setPhone] = useState(creator?.phone ?? "");
  const [courseTitle, setCourseTitle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#c84b31");
  const [saving, setSaving] = useState(false);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const saveStep1 = useCallback(async () => {
    if (!name.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      await updateSettings.mutateAsync({ name, bio, phone });
      setStep(2);
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }, [name, bio, phone, updateSettings]);

  const saveStep3 = useCallback(async () => {
    if (!courseTitle.trim()) { toast.error("Course title is required."); return; }
    setSaving(true);
    try {
      const course = await createCourse.mutateAsync({ title: courseTitle.trim() });
      setStep(4);
      toast.success("Course created!");
      // Store course id in case user wants to go straight to builder
      sessionStorage.setItem("onboarding_course_id", course.id);
    } catch {
      toast.error("Failed to create course.");
    } finally {
      setSaving(false);
    }
  }, [courseTitle, createCourse]);

  const saveStep4 = useCallback(async () => {
    setSaving(true);
    try {
      await updateSettings.mutateAsync({ primary_color: primaryColor });
      setStep(5);
    } catch {
      toast.error("Failed to save branding.");
    } finally {
      setSaving(false);
    }
  }, [primaryColor, updateSettings]);

  const completeOnboarding = useCallback(async () => {
    setSaving(true);
    try {
      await api.post("/creator/onboarding/complete");
      toast.success("You're all set! Welcome to CreatorHub 🎉");
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Welcome to CreatorHub</h1>
          <p className="mt-1 text-sm text-muted">Let's get you set up in 5 quick steps.</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold shrink-0",
                  done ? "border-accent bg-accent text-white" :
                  active ? "border-accent text-accent bg-white" :
                  "border-warm text-muted bg-white"
                )}>
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-1", done ? "bg-accent" : "bg-warm")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-warm bg-white p-8 shadow-sm">

          {/* Step 1 — Profile */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-ink">Your profile</h2>
                <p className="text-sm text-muted">This is what students will see on your public page.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Display name *</label>
                <input className={inputClass()} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Bio</label>
                <textarea className={inputClass("resize-none")} rows={3} maxLength={500} placeholder="Tell students about yourself" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Phone (for Razorpay)</label>
                <input className={inputClass()} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <Button className="w-full" onClick={saveStep1} isLoading={saving}>Save & Continue</Button>
            </div>
          )}

          {/* Step 2 — Payments */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-ink">Connect Razorpay</h2>
                <p className="text-sm text-muted">You need a Razorpay account to collect payments from students.</p>
              </div>
              <div className="rounded-xl border border-warm bg-cream p-5">
                <ol className="space-y-2 text-sm text-ink">
                  <li><span className="font-semibold">1.</span> Sign up at <span className="font-mono text-accent">razorpay.com</span></li>
                  <li><span className="font-semibold">2.</span> Go to Settings → API Keys → Generate Key</li>
                  <li><span className="font-semibold">3.</span> Add your Key ID and Key Secret in <span className="font-medium">Settings → Payments</span></li>
                </ol>
              </div>
              <p className="text-xs text-muted">You can complete this later. Students won't be able to purchase courses until this is connected.</p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(3)} className="flex-1">Skip for now</Button>
                <Button onClick={() => { router.push("/dashboard/settings?tab=business"); }} variant="secondary" className="flex-1">Go to Settings</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {/* Step 3 — First Course */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-ink">Create your first course</h2>
                <p className="text-sm text-muted">Give it a working title — you can change it anytime.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Course title *</label>
                <input
                  className={inputClass()}
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveStep3()}
                  placeholder="e.g. Complete React Masterclass"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(4)} className="flex-1">Skip for now</Button>
                <Button onClick={saveStep3} isLoading={saving} disabled={!courseTitle.trim()} className="flex-1">Create Course</Button>
              </div>
            </div>
          )}

          {/* Step 4 — Website / branding */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-ink">Brand your website</h2>
                <p className="text-sm text-muted">Choose a primary colour for your public storefront.</p>
              </div>
              <div className="flex items-center gap-4">
                <input type="color" className="h-12 w-20 cursor-pointer rounded-xl border border-warm p-1" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                <div>
                  <p className="text-sm font-medium text-ink" style={{ color: primaryColor }}>Preview colour</p>
                  <p className="text-xs text-muted">This will be your button and link colour</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(5)} className="flex-1">Skip</Button>
                <Button onClick={saveStep4} isLoading={saving} className="flex-1">Save & Continue</Button>
              </div>
            </div>
          )}

          {/* Step 5 — Custom domain */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-ink">Custom domain</h2>
                <p className="text-sm text-muted">Your store is live at <span className="font-mono text-accent">{creator?.slug}.createrhub.in</span></p>
              </div>
              <div className="rounded-xl border border-warm bg-cream p-5 text-sm">
                <p className="mb-2 font-medium text-ink">Want a custom domain like <span className="text-accent">learn.yourbrand.com</span>?</p>
                <p className="text-muted">Add a CNAME record pointing to <span className="font-mono text-ink">creators.createrhub.in</span>, then verify it in Settings → Business & GST.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={completeOnboarding} className="flex-1" isLoading={saving}>Skip & Go to Dashboard</Button>
                <Button onClick={completeOnboarding} className="flex-1" isLoading={saving}>Finish Setup</Button>
              </div>
            </div>
          )}
        </div>

        {/* Step label */}
        <p className="mt-4 text-center text-xs text-muted">
          Step {step} of {STEPS.length} — {STEPS[step - 1].label}
        </p>
      </div>
    </div>
  );
}
