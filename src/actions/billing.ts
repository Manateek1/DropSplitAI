"use server";

import { isStripeConfigured } from "@/lib/env";
import { getStripeServer } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthActionResult } from "@/types/domain";

export async function createCheckoutAction(): Promise<AuthActionResult> {
  if (!isStripeConfigured) {
    return { ok: true, message: "Stripe is not configured yet. Add keys to enable checkout." };
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/stripe/checkout`, {
    method: "POST",
    cache: "no-store",
  });
  const payload = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    return { ok: false, message: payload.error ?? "Unable to start checkout." };
  }

  return { ok: true, redirectTo: payload.url };
}

export async function createBillingPortalAction(): Promise<AuthActionResult> {
  if (!isStripeConfigured) {
    return { ok: true, message: "Stripe is not configured yet." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You need to be logged in." };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return { ok: false, message: "No Stripe customer found yet." };
  }

  const stripe = getStripeServer();
  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing`,
  });

  return { ok: true, redirectTo: portal.url };
}
