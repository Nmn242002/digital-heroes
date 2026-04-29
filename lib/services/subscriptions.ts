import { repository } from "@/lib/services/mockDataStore";
import type { SubscriptionPlan } from "@/lib/types";

export function activateMockSubscription(userId: string, plan: SubscriptionPlan) {
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + (plan === "yearly" ? 12 : 1));

  repository.users.update(userId, { subscriptionStatus: "active" });
  return repository.subscriptions.upsert({
    userId,
    plan,
    status: "active",
    currentPeriodEnd: periodEnd.toISOString(),
    stripeCustomerId: `cus_mock_${userId}`
  });
}

export function hasActiveSubscription(userId: string) {
  const user = repository.users.findById(userId);
  const subscription = repository.subscriptions.forUser(userId);
  if (!user || user.subscriptionStatus !== "active" || !subscription) return false;
  return subscription.status === "active" && new Date(subscription.currentPeriodEnd) > new Date();
}
