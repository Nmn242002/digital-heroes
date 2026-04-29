// ---------- ROLES ----------

export type Role = "user" | "admin";

export type SubscriptionStatus = "active" | "expired" | "cancelled";

// ---------- USER ----------

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

// ---------- CHARITY ----------

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

// ---------- SCORE ----------

export type Score = {
  id: string;
  userId: string;
  date: string;
  score: number;
  createdAt: string;
};

// ---------- SUBSCRIPTION ----------

export type SubscriptionPlan = "monthly" | "yearly";

export type Subscription = {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
};

// ---------- DRAW ----------

export type DrawMode = "random" | "weighted";

export type DrawStatus = "open" | "closed" | "published";

export type Draw = {
  id: string;
  month: string;
  numbers: number[];
  mode: DrawMode;
  prizePool: number;
  status: DrawStatus;
  rolloverAmount: number;
  createdAt: string;
  publishedAt?: string;
};

// ---------- WINNING ----------

export type MatchType =
  | "3-match"
  | "4-match"
  | "5-match"
  | "jackpot";

export type WinningStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "paid";

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

// ---------- EMAIL NOTIFICATION ----------

export type EmailNotification = {
  to: string;
  subject: string;
  body: string;
};
