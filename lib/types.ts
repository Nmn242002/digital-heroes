// ---------- ROLES ----------

export type Role = "user" | "admin";

// ---------- USER ----------

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  subscriptionStatus: "active" | "expired";
  charityId: string;
  charityContributionPercent: number;
};

export type PublicUser = Omit<User, "passwordHash">;

// ---------- CHARITY ----------

export type Charity = {
  id: string;
  name: string;
  impact: string;
};

// ---------- SCORE ----------

export type Score = {
  id: string;
  userId: string;
  date: string;
  points: number;
};

// ---------- SUBSCRIPTION ----------

export type Subscription = {
  userId: string;
  plan: "monthly" | "yearly";
  currentPeriodEnd: string;
};

// ---------- DRAW ----------

export type DrawMode = "auto" | "manual";

export type DrawStatus = "open" | "closed";

export type Draw = {
  id: string;
  month: string;
  numbers: number[];
  prizePool: number;
  status: DrawStatus;
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