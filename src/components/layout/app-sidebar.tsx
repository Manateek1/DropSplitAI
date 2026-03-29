"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, CreditCard, LayoutDashboard, LogOut, NotebookTabs, Settings, Waves } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { LogoMark } from "@/components/common/logo-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Coach chat", icon: Bot },
  { href: "/plan", label: "Weekly plan", icon: NotebookTabs },
  { href: "/log", label: "Swim log", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pb-8 pt-2">
        <LogoMark />
      </div>
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-3 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
        <nav className="space-y-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                  active
                    ? "bg-slate-950 text-white shadow-[0_18px_38px_-24px_rgba(15,23,42,0.7)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-4 rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(20,216,230,0.16),_transparent_60%),white] p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.25)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Coach quick tip</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Keep the last 10 yards calm on sprint free. Speed falls off when you rush the catch.
            </p>
          </div>
        </div>
        <form action={signOutAction}>
          <Button variant="outline" className="w-full justify-start rounded-2xl border-slate-200 text-slate-700">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
