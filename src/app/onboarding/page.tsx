import { redirect } from "next/navigation";

import { SetupRequired } from "@/components/common/setup-required";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getProductionConfigMessage, hasProductionConfigError, isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { getOnboardingDefaults, getViewerState } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  if (hasProductionConfigError) {
    return <SetupRequired message={getProductionConfigMessage()} />;
  }

  if (!isSupabaseConfigured && !isDemoMode) {
    return <SetupRequired message={hasProductionConfigError ? getProductionConfigMessage() : "Supabase is not configured."} />;
  }

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }

  const [defaultValues, viewer] = await Promise.all([getOnboardingDefaults(), getViewerState()]);

  if (viewer.onboardingCompleted && isSupabaseConfigured) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <OnboardingForm defaultValues={defaultValues} />
    </div>
  );
}
