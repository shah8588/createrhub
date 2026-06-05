"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  BarChart3,
  Globe,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/website", label: "Website", icon: Globe },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch {
      toast.error("Failed to log out");
    }
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-surface-border bg-surface">
      <div className="px-5 py-6">
        <span className="font-display text-lg font-bold text-paper">
          CreatorHub
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface-2 hover:text-paper"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-paper"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
