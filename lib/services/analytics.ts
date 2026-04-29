import { repository } from "@/lib/db/repository";
import { currentPrizePool } from "@/lib/services/draws";

export function getAnalytics() {
  const activeSubscriptions = repository.subscriptions.all().filter((subscription) => subscription.status === "active");
  const totalRevenue = activeSubscriptions.reduce((total, subscription) => total + (subscription.plan === "yearly" ? 180 : 18), 0);
  const charityContributions = repository.users
    .all()
    .filter((user) => user.subscriptionStatus === "active")
    .reduce((total, user) => total + (18 * user.charityContributionPercent) / 100, 0);

  return {
    totalUsers: repository.users.all().length,
    activeSubscriptions: activeSubscriptions.length,
    totalPrizePool: currentPrizePool(),
    charityContributions: Number(charityContributions.toFixed(2)),
    pendingPayouts: repository.winnings.all().filter((winning) => winning.status === "pending").length,
    totalRevenue
  };
}
