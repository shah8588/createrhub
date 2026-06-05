import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-paper">Settings</h1>
      <p className="text-muted">Account settings coming soon.</p>
    </div>
  );
}
