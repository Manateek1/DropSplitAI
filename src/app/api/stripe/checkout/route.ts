import { NextResponse } from "next/server";

import { env, isStripeConfigured } from "@/lib/env";
import { getStripeServer } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
    }

    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existingSubscription?.stripe_customer_id ?? undefined,
      customer_email: existingSubscription?.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: env.stripePriceIdPro!, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_id: user.id },
      },
      metadata: { user_id: user.id },
      success_url: `${env.appUrl}/billing?checkout=success`,
      cancel_url: `${env.appUrl}/billing?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create checkout session." },
      { status: 500 },
    );
  }
}
