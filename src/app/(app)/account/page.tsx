import { BillingPanel } from "@/components/billing/billing-panel";
import { SetupRequired } from "@/components/common/setup-required";
import { SettingsPanels } from "@/components/settings/settings-panels";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data";
import { getProductionConfigMessage, hasProductionConfigError, isStripeConfigured } from "@/lib/env";

export default async function AccountPage() {
  if (hasProductionConfigError) {
    return <SetupRequired message={getProductionConfigMessage()} />;
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.2)]">
        <CardContent className="p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-600">Account</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Profile, coaching preferences, and billing</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            These settings shape how the coach writes, adjusts workouts, and manages your subscription.
          </p>
        </CardContent>
      </Card>
      <SettingsPanels dashboardData={data} />
      <BillingPanel dashboardData={data} billingConfigured={isStripeConfigured} />
    </div>
  );
}
