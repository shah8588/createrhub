import type { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-paper">
      {children}
    </div>
  );
}
