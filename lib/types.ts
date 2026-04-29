export type Role = "user" | "admin";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type SubscriptionPlan = "monthly" | "yearly";
export type DrawStatus = "draft" | "simulated" | "published";
export type DrawMode = "random" | "weighted";
export type MatchType = "5-match" | "4-match" | "3-match";
export type WinningStatus = "pending" | "approved" | "rejected" | "paid";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  subscriptionStatus: SubscriptionStatus;
  charityId: string;
  charityContributionPercent: number;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Score = {
  id: string;
  userId: string;
  score: number;
  date: string;
  createdAt: string;
};

export type Charity = {
  id: string;
  name: string;
  description: string;
  impact: string;
  location: string;
  imageUrl: string;
  website: string;
  founded: string;
  focusAreas: string[];
  upcomingEvents: string[];
  raisedTodayBase: number;
  supporters: number;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
};

export type Draw = {
  id: string;
  month: string;
  numbers: number[];
  mode: DrawMode;
  status: DrawStatus;
  prizePool: number;
  rolloverAmount: number;
  createdAt: string;
  publishedAt?: string;
};

export type Winning = {
  id: string;
  userId: string;
  drawId: string;
  matchType: MatchType;
  amount: number;
  status: WinningStatus;
  proofUrl?: string;
  reviewedAt?: string;
  createdAt: string;
};

export type Analytics = {
  totalUsers: number;
  activeSubscriptions: number;
  totalPrizePool: number;
  charityContributions: number;
  pendingPayouts: number;
};
