import type { Charity, Draw, Score, Subscription, User, Winning } from "@/lib/types";

const now = new Date().toISOString();
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);

export const charities: Charity[] = [
  {
    id: "charity-youth",
    name: "Fairways Forward",
    description: "Opening access to coaching, equipment, and mentoring for young players.",
    impact: "Every subscription helps fund supervised practice time and transport.",
    location: "United Kingdom",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
    website: "fairwaysforward.org",
    founded: "2018",
    focusAreas: ["Youth access", "Mentoring", "Equipment grants"],
    upcomingEvents: ["Community skills day", "Junior coaching weekend", "Summer scholarship draw"],
    raisedTodayBase: 2840,
    supporters: 412
  },
  {
    id: "charity-health",
    name: "Mind in Motion",
    description: "Community mental health support built around movement and belonging.",
    impact: "Contributions support local sessions and peer-led recovery programs.",
    location: "Ireland",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    website: "mindinmotion.ie",
    founded: "2016",
    focusAreas: ["Mental health", "Peer support", "Movement therapy"],
    upcomingEvents: ["Wellbeing walk", "Peer host training", "Open support evening"],
    raisedTodayBase: 3915,
    supporters: 638
  },
  {
    id: "charity-nature",
    name: "Green Ground Trust",
    description: "Restoring public green spaces with native planting and accessible paths.",
    impact: "User pledges fund habitat work, volunteer tools, and maintenance.",
    location: "Scotland",
    imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1400&q=80",
    website: "greengroundtrust.scot",
    founded: "2020",
    focusAreas: ["Public green space", "Native planting", "Accessible paths"],
    upcomingEvents: ["Planting day", "Volunteer path repair", "Habitat survey"],
    raisedTodayBase: 2175,
    supporters: 289
  }
];

export const users: User[] = [
  {
    id: "admin-1",
    email: "admin@drawclub.local",
    passwordHash: "demo-admin",
    role: "admin",
    subscriptionStatus: "active",
    charityId: "charity-youth",
    charityContributionPercent: 15,
    createdAt: now
  },
  {
    id: "user-1",
    email: "member@drawclub.local",
    passwordHash: "demo-member",
    role: "user",
    subscriptionStatus: "active",
    charityId: "charity-health",
    charityContributionPercent: 12,
    createdAt: now
  }
];

export const scores: Score[] = [
  { id: "score-1", userId: "user-1", score: 33, date: "2026-04-02", createdAt: now },
  { id: "score-2", userId: "user-1", score: 28, date: "2026-04-09", createdAt: now },
  { id: "score-3", userId: "user-1", score: 39, date: "2026-04-16", createdAt: now },
  { id: "score-4", userId: "user-1", score: 31, date: "2026-04-23", createdAt: now }
];

export const subscriptions: Subscription[] = [
  {
    id: "sub-1",
    userId: "user-1",
    plan: "monthly",
    status: "active",
    currentPeriodEnd: nextMonth.toISOString(),
    stripeCustomerId: "cus_mock_member"
  },
  {
    id: "sub-2",
    userId: "admin-1",
    plan: "yearly",
    status: "active",
    currentPeriodEnd: nextMonth.toISOString(),
    stripeCustomerId: "cus_mock_admin"
  }
];

export const draws: Draw[] = [
  {
    id: "draw-1",
    month: "2026-04",
    numbers: [9, 18, 27, 36, 42],
    mode: "weighted",
    status: "published",
    prizePool: 8600,
    rolloverAmount: 1200,
    createdAt: now,
    publishedAt: now
  }
];

export const winnings: Winning[] = [
  {
    id: "win-1",
    userId: "user-1",
    drawId: "draw-1",
    matchType: "3-match",
    amount: 215,
    status: "approved",
    createdAt: now
  }
];
