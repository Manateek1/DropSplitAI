"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { createBillingPortalAction, createCheckoutAction } from "@/actions/billing";
import { PricingCard } from "@/components/billing/pricing-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingTiers } from "@/lib/stripe";
import type { DashboardData } from "@/types/domain";

export function BillingPanel({ dashboardData }: { dashboardData: DashboardData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const runAction = (action: () => Promise<{ ok: boolean; message?: string; redirectTo?: string }>) => {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.message ?? "Unable to complete billing action.");
        return;
      }
      if (result.message) {
        toast.success(result.message);
      }
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.2)]">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight text-slate-950">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Current tier</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{dashboardData.subscription.tier === "pro" ? "Unlimited" : "Free"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Usage</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {dashboardData.subscription.messagesUsed}
              {dashboardData.subscription.messageLimit ? ` / ${dashboardData.subscription.messageLimit}` : ""}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{dashboardData.subscription.status}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {pricingTiers.map((tier) => (
          <PricingCard
            key={tier.id}
            {...tier}
            disabled={pending || (tier.id === dashboardData.subscription.tier && tier.id === "free")}
            ctaLabel={tier.id === "pro" && dashboardData.subscription.tier === "pro" ? "Manage subscription" : tier.ctaLabel}
            onClick={() => {
              if (tier.id === "pro" && dashboardData.subscription.tier === "pro") {
                runAction(createBillingPortalAction);
                return;
              }

              if (tier.id === "pro") {
                runAction(createCheckoutAction);
                return;
              }

              toast.message("You are already on the free plan.");
            }}
          />
        ))}
      </div>
    </div>
  );
}
