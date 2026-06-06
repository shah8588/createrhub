"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { User, Palette, Building2, Lock, Globe, Copy } from "lucide-react";
import { useSettings, useUpdateSettings, useChangePassword } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const FONTS = ["DM Sans", "Inter", "Outfit", "Plus Jakarta Sans", "Sora", "Nunito", "Lato", "Poppins", "Raleway", "Figtree"];

const INDIAN_STATES: { code: string; name: string }[] = [
  { code: "01", name: "Jammu & Kashmir" }, { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" }, { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" }, { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" }, { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" }, { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" }, { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" }, { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" }, { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" }, { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" }, { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" }, { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" }, { code: "24", name: "Gujarat" },
  { code: "27", name: "Maharashtra" }, { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" }, { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" }, { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
];

type Tab = "profile" | "branding" | "business" | "password";

function SectionField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted/70">{hint}</p>}
    </div>
  );
}

function inputClass(extra?: string) {
  return cn(
    "w-full rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-paper placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50",
    extra
  );
}

export default function SettingsPage() {
  const { data: creator, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const changePassword = useChangePassword();

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Business fields
  const [gstin, setGstin] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [stateCode, setStateCode] = useState("");

  // Branding fields
  const [primaryColor, setPrimaryColor] = useState("#c84b31");
  const [secondaryColor, setSecondaryColor] = useState("#2d6a4f");
  const [fontFamily, setFontFamily] = useState("DM Sans");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sync remote data into local state
  const [synced, setSynced] = useState(false);
  if (creator && !synced) {
    setName(creator.name ?? "");
    setBio(creator.bio ?? "");
    setPhone(creator.phone ?? "");
    setYoutubeUrl(creator.youtube_url ?? "");
    setInstagramHandle(creator.instagram_handle ?? "");
    setTwitterHandle(creator.twitter_handle ?? "");
    setWebsiteUrl(creator.website_url ?? "");
    setGstin(creator.gstin ?? "");
    setBusinessName(creator.business_name ?? "");
    setBusinessAddress(creator.business_address ?? "");
    setStateCode(creator.state_code ?? "");
    setPrimaryColor(creator.settings?.primary_color ?? "#c84b31");
    setSecondaryColor(creator.settings?.secondary_color ?? "#2d6a4f");
    setFontFamily(creator.settings?.font_family ?? "DM Sans");
    setInvoicePrefix(creator.settings?.invoice_prefix ?? "INV");
    setSynced(true);
  }

  const saveProfile = useCallback(async () => {
    try {
      await updateSettings.mutateAsync({ name, bio, phone, youtube_url: youtubeUrl, instagram_handle: instagramHandle, twitter_handle: twitterHandle, website_url: websiteUrl });
      toast.success("Profile saved.");
    } catch {
      toast.error("Failed to save profile.");
    }
  }, [name, bio, phone, youtubeUrl, instagramHandle, twitterHandle, websiteUrl, updateSettings]);

  const saveBusiness = useCallback(async () => {
    try {
      await updateSettings.mutateAsync({ gstin, business_name: businessName, business_address: businessAddress, state_code: stateCode });
      toast.success("Business details saved.");
    } catch {
      toast.error("Failed to save business details.");
    }
  }, [gstin, businessName, businessAddress, stateCode, updateSettings]);

  const saveBranding = useCallback(async () => {
    try {
      await updateSettings.mutateAsync({ primary_color: primaryColor, secondary_color: secondaryColor, font_family: fontFamily, invoice_prefix: invoicePrefix });
      toast.success("Branding saved.");
    } catch {
      toast.error("Failed to save branding.");
    }
  }, [primaryColor, secondaryColor, fontFamily, invoicePrefix, updateSettings]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await changePassword.mutateAsync({ current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword });
      toast.success("Password changed. Please log in again.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      toast.error("Incorrect current password.");
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "branding", label: "Branding", icon: <Palette className="h-4 w-4" /> },
    { id: "business", label: "Business & GST", icon: <Building2 className="h-4 w-4" /> },
    { id: "password", label: "Password", icon: <Lock className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-40 bg-surface" />
        <Skeleton className="h-48 bg-surface" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Tab sidebar */}
      <div className="w-52 shrink-0 border-r border-surface-border p-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              activeTab === tab.id
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-surface-2 hover:text-paper"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">

        {/* ── Profile ── */}
        {activeTab === "profile" && (
          <div className="max-w-lg space-y-5">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-paper">Profile</h2>
              <p className="text-sm text-muted">Your public creator profile.</p>
            </div>

            <SectionField label="Display name">
              <input className={inputClass()} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </SectionField>

            <SectionField label="Email">
              <input className={inputClass("opacity-60 cursor-not-allowed")} value={creator?.email ?? ""} readOnly />
            </SectionField>

            <SectionField label="Public URL" hint={`createrhub.in/${creator?.slug}`}>
              <div className="flex items-center gap-2">
                <input className={inputClass("flex-1 opacity-60 cursor-not-allowed")} value={creator?.slug ?? ""} readOnly />
                <button
                  onClick={() => { navigator.clipboard.writeText(`https://${creator?.slug}.createrhub.in`); toast.success("Copied!"); }}
                  className="rounded-lg border border-surface-border p-2 text-muted hover:text-paper"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </SectionField>

            <SectionField label="Bio" hint="Max 500 characters.">
              <textarea
                className={inputClass("resize-none")}
                rows={3}
                maxLength={500}
                placeholder="Tell students about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </SectionField>

            <SectionField label="Phone">
              <input className={inputClass()} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </SectionField>

            <div className="border-t border-surface-border pt-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Social links</p>
              <div className="space-y-3">
                <SectionField label="YouTube channel URL">
                  <input className={inputClass()} value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/@handle" />
                </SectionField>
                <SectionField label="Instagram handle">
                  <input className={inputClass()} value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@yourhandle" />
                </SectionField>
                <SectionField label="Twitter / X handle">
                  <input className={inputClass()} value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@yourhandle" />
                </SectionField>
                <SectionField label="Website">
                  <input className={inputClass()} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com" />
                </SectionField>
              </div>
            </div>

            <Button onClick={saveProfile} isLoading={updateSettings.isPending}>
              Save Profile
            </Button>
          </div>
        )}

        {/* ── Branding ── */}
        {activeTab === "branding" && (
          <div className="max-w-lg space-y-5">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-paper">Branding</h2>
              <p className="text-sm text-muted">Colours and fonts applied to your public storefront.</p>
            </div>

            <SectionField label="Primary colour">
              <div className="flex items-center gap-3">
                <input type="color" className="h-9 w-16 cursor-pointer rounded-lg border border-surface-border bg-transparent p-1" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                <input className={inputClass("flex-1 font-mono")} value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#c84b31" maxLength={7} />
              </div>
            </SectionField>

            <SectionField label="Secondary colour">
              <div className="flex items-center gap-3">
                <input type="color" className="h-9 w-16 cursor-pointer rounded-lg border border-surface-border bg-transparent p-1" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                <input className={inputClass("flex-1 font-mono")} value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} placeholder="#2d6a4f" maxLength={7} />
              </div>
            </SectionField>

            <SectionField label="Font family">
              <select className={inputClass()} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </SectionField>

            <SectionField label="Invoice prefix" hint="E.g. INV → INV-2025-0001">
              <input className={inputClass("w-40")} value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="INV" maxLength={10} />
            </SectionField>

            <Button onClick={saveBranding} isLoading={updateSettings.isPending}>
              Save Branding
            </Button>
          </div>
        )}

        {/* ── Business & GST ── */}
        {activeTab === "business" && (
          <div className="max-w-lg space-y-5">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-paper">Business & GST</h2>
              <p className="text-sm text-muted">Required for generating GST-compliant invoices.</p>
            </div>

            <SectionField label="GSTIN" hint="15-character GST number e.g. 29ABCDE1234F1Z5">
              <input
                className={inputClass("font-mono uppercase")}
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="29ABCDE1234F1Z5"
                maxLength={15}
              />
            </SectionField>

            <SectionField label="Registered business name">
              <input className={inputClass()} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="As per GST registration" />
            </SectionField>

            <SectionField label="Business address">
              <textarea className={inputClass("resize-none")} rows={3} value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Full address as on GST certificate" />
            </SectionField>

            <SectionField label="State">
              <select className={inputClass()} value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </SectionField>

            <Button onClick={saveBusiness} isLoading={updateSettings.isPending}>
              Save Business Details
            </Button>

            {/* Custom domain section */}
            <div className="border-t border-surface-border pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted" />
                <h3 className="text-sm font-medium text-paper">Custom Domain</h3>
              </div>
              {creator?.settings?.custom_domain ? (
                <div className="rounded-lg border border-surface-border bg-surface-2 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-paper">{creator.settings.custom_domain}</p>
                      <p className={cn("mt-0.5 text-xs", creator.settings.domain_status === "active" ? "text-green-400" : "text-amber-400")}>
                        {creator.settings.domain_status === "active" ? "Active" : "Pending DNS verification"}
                      </p>
                    </div>
                  </div>
                  {creator.settings.domain_status !== "active" && (
                    <div className="mt-3 rounded bg-surface p-3 text-xs text-muted">
                      Add a CNAME record pointing <strong className="text-paper">{creator.settings.custom_domain}</strong> →{" "}
                      <strong className="font-mono text-paper">creators.createrhub.in</strong>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">Connect a custom domain in the Website section.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Password ── */}
        {activeTab === "password" && (
          <div className="max-w-sm space-y-5">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-paper">Change Password</h2>
              <p className="text-sm text-muted">All active sessions will be signed out.</p>
            </div>

            <SectionField label="Current password">
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </SectionField>

            <SectionField label="New password">
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            </SectionField>

            <SectionField label="Confirm new password">
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            </SectionField>

            <Button
              onClick={handleChangePassword}
              isLoading={changePassword.isPending}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Change Password
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
