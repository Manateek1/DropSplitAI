import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { env, isStripeConfigured, isSupabaseAdminConfigured } from "@/lib/env";
import { getStripeServer } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

function mapStatus(status: Stripe.Subscription.Status) {
  if (status === "active" || status === "trialing" || status === "past_due" || status === "canceled" || status === "incomplete") {
    return status;
  }

  return "free";
}

export async function POST(request: Request) {
  if (!isStripeConfigured || !isSupabaseAdminConfigured) {
    return NextResponse.json({ received: true });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripeServer();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret!);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid signature." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (userId) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        tier: "pro",
        status: "active",
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        monthly_message_limit: null,
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.user_id;
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
    if (userId) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        tier: subscription.status === "active" || subscription.status === "trialing" ? "pro" : "free",
        status: mapStatus(subscription.status),
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
        monthly_message_limit: subscription.status === "active" || subscription.status === "trialing" ? null : 40,
      });
    }
  }

  return NextResponse.json({ received: true });
}
