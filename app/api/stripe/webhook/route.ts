import { NextRequest } from "next/server";
import { json } from "@/lib/api";
import { activateMockSubscription } from "@/lib/services/subscriptions";
import type { SubscriptionPlan } from "@/lib/types";

export async function POST(request: NextRequest) {
  const event = await request.json();
  const session = event?.data?.object;
  const userId = session?.metadata?.userId;
  const plan = session?.metadata?.plan as SubscriptionPlan | undefined;

  if (event?.type === "checkout.session.completed" && userId && plan) {
    const subscription = activateMockSubscription(userId, plan);
    return json({ received: true, subscription });
  }

  return json({ received: true });
}
