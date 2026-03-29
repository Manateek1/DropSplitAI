import Stripe from "stripe";

import { env, isStripeConfigured } from "@/lib/env";

let stripeInstance: Stripe | null = null;

export function getStripeServer() {
  if (!isStripeConfigured) {
    throw new Error("Stripe is not configured.");
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(env.stripeSecretKey!);
  }

  return stripeInstance;
}

export const pricingTiers = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    description: "Enough messages to try real coach-style support every month.",
    features: [
      "Personalized onboarding",
      "Weekly swim plan",
      "Swim log and progress tracking",
      "40 AI coach messages / month",
    ],
    ctaLabel: "Start free",
  },
  {
    id: "pro",
    name: "Unlimited",
    priceLabel: "$15",
    cadence: "/month",
    description: "Unlimited coach chat, faster plan updates, and premium training support.",
    features: [
      "Unlimited AI coaching",
      "Advanced weekly plan adjustments",
      "Priority image result extraction",
      "Billing portal access",
    ],
    ctaLabel: "Upgrade now",
    highlighted: true,
  },
] as const;
