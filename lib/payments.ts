import type { SubscriptionPlan } from "@/lib/types";

const prices: Record<SubscriptionPlan, { amount: number; label: string }> = {
  monthly: { amount: 1800, label: "DrawClub Monthly" },
  yearly: { amount: 18000, label: "DrawClub Yearly" }
};

export async function createCheckoutSession(input: {
  plan: SubscriptionPlan;
  userId: string;
  email: string;
  origin: string;
}) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const price = prices[input.plan];

  if (!stripeKey) {
    return {
      mode: "mock",
      url: null,
      message: "Mock Stripe checkout complete. Add STRIPE_SECRET_KEY to open real hosted checkout."
    };
  }

  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${input.origin}/dashboard?checkout=success`,
    cancel_url: `${input.origin}/dashboard?checkout=cancelled`,
    customer_email: input.email,
    client_reference_id: input.userId,
    "metadata[userId]": input.userId,
    "metadata[plan]": input.plan,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "gbp",
    "line_items[0][price_data][unit_amount]": String(price.amount),
    "line_items[0][price_data][product_data][name]": price.label
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe checkout failed: ${error}`);
  }

  const session = (await response.json()) as { id: string; url: string };
  return {
    mode: "stripe",
    sessionId: session.id,
    url: session.url,
    message: "Stripe Checkout session created."
  };
}
