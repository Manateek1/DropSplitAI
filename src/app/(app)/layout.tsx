import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { isSupabaseConfigured } from "@/lib/env";
import { getViewerState } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }

  const viewer = await getViewerState();

  if (!viewer.onboardingCompleted && isSupabaseConfigured) {
    redirect("/onboarding");
  }

  return <AppShell user={viewer.user} demoMode={viewer.demoMode}>{children}</AppShell>;
}
