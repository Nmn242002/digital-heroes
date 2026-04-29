import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { createCheckoutSession } from "@/lib/payments";
import { activateMockSubscription } from "@/lib/services/subscriptions";
import type { SubscriptionPlan } from "@/lib/types";

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if ("status" in user) return user;
  const body = await request.json();
  const plan = String(body.plan ?? "monthly") as SubscriptionPlan;

  if (!["monthly", "yearly"].includes(plan)) return json({ error: "Invalid plan." }, 400);

  try {
    const checkout = await createCheckoutSession({
      plan,
      userId: user.id,
      email: user.email,
      origin: request.nextUrl.origin
    });
    const subscription = checkout.mode === "mock" ? activateMockSubscription(user.id, plan) : undefined;
    return json({ subscription, checkout });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unable to create checkout." }, 502);
  }
}
