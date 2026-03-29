import { Menu } from "lucide-react";

import { DemoBadge } from "@/components/common/demo-badge";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { initials } from "@/lib/utils";
import type { AppUser } from "@/types/domain";

export function AppShell({ children, user, demoMode }: { children: React.ReactNode; user: AppUser; demoMode: boolean }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1440px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[290px] shrink-0 lg:block">
          <AppSidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex items-center justify-between rounded-[28px] border border-white/70 bg-white/90 px-4 py-4 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger
                  render={<Button variant="outline" size="icon" className="rounded-2xl border-slate-200 lg:hidden" />}
                >
                  <Menu className="h-4 w-4" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] border-slate-200 bg-[#F5F7FA] p-4">
                  <AppSidebar />
                </SheetContent>
              </Sheet>
              <div>
                <p className="text-sm text-slate-500">Hey {user.firstName}, here&apos;s your week.</p>
                <h1 className="text-lg font-semibold tracking-tight text-slate-950">Coach-style swim guidance, all in one place</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {demoMode ? <DemoBadge /> : null}
              <Avatar className="h-11 w-11 rounded-2xl border border-slate-200 bg-slate-100">
                <AvatarFallback className="rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                  {initials(user.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
