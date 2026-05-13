"use server";

import { env, isStripeConfigured, isSupabaseConfigured } from "@/lib/env";
import { logServerError, trackEvent } from "@/lib/observability";
import { getStripeServer } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthActionResult } from "@/types/domain";

export async function createCheckoutAction(): Promise<AuthActionResult> {
  if (!isStripeConfigured) {
    return { ok: false, message: "Billing is not configured yet." };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: "Create an account before starting checkout." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "You need to be logged in." };
    }

    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("tier,status,stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (existingSubscription?.tier === "pro" && ["active", "trialing"].includes(existingSubscription.status)) {
      return { ok: false, message: "You already have an active subscription." };
    }

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existingSubscription?.stripe_customer_id ?? undefined,
      customer_email: existingSubscription?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [{ price: env.stripePriceIdPro!, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_id: user.id },
      },
      metadata: { user_id: user.id },
      success_url: `${env.appUrl}/account?checkout=success`,
      cancel_url: `${env.appUrl}/account?checkout=cancelled`,
    });

    if (!session.url) {
      return { ok: false, message: "Stripe did not return a checkout URL." };
    }

    await trackEvent("checkout_started", user.id);
    return { ok: true, redirectTo: session.url };
  } catch (error) {
    logServerError("createCheckoutAction", error);
    return { ok: false, message: "Unable to start checkout." };
  }
}

export async function createBillingPortalAction(): Promise<AuthActionResult> {
  if (!isStripeConfigured) {
    return { ok: false, message: "Billing is not configured yet." };
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

  try {
    const stripe = getStripeServer();
    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${env.appUrl}/account`,
    });

    return { ok: true, redirectTo: portal.url };
  } catch (error) {
    logServerError("createBillingPortalAction", error);
    return { ok: false, message: "Unable to open the billing portal." };
  }
}
