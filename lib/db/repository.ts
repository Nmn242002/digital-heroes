import fs from "node:fs";
import path from "node:path";
import { charities as seedCharities, draws as seedDraws, scores as seedScores, subscriptions as seedSubscriptions, users as seedUsers, winnings as seedWinnings } from "@/lib/db/mock";
import type { Charity, Draw, Score, Subscription, SubscriptionStatus, User, Winning, WinningStatus } from "@/lib/types";

type Store = {
  charities: Charity[];
  users: User[];
  scores: Score[];
  subscriptions: Subscription[];
  draws: Draw[];
  winnings: Winning[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "drawclub-db.json");
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const todayIso = () => new Date().toISOString();

const seedStore = (): Store => ({
  charities: seedCharities,
  users: seedUsers,
  scores: seedScores,
  subscriptions: seedSubscriptions,
  draws: seedDraws,
  winnings: seedWinnings
});

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(seedStore(), null, 2));
  }
}

function readStore(): Store {
  ensureStore();
  const store = JSON.parse(fs.readFileSync(dataFile, "utf8")) as Store;
  const seeded = seedStore();
  store.charities = store.charities.map((charity) => ({
    ...seeded.charities.find((seedCharity) => seedCharity.id === charity.id),
    ...charity
  }));
  return store;
}

function writeStore(store: Store) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

function mutate<T>(callback: (store: Store) => T) {
  const store = readStore();
  const result = callback(store);
  writeStore(store);
  return result;
}

export const repository = {
  users: {
    all: () => readStore().users,
    findById: (userId: string) => readStore().users.find((user) => user.id === userId),
    findByEmail: (email: string) => readStore().users.find((user) => user.email.toLowerCase() === email.toLowerCase()),
    create: (input: Omit<User, "id" | "createdAt">) =>
      mutate((store) => {
        const user: User = { ...input, id: id("user"), createdAt: todayIso() };
        store.users.push(user);
        return user;
      }),
    update: (userId: string, patch: Partial<User>) =>
      mutate((store) => {
        const user = store.users.find((item) => item.id === userId);
        if (!user) return undefined;
        Object.assign(user, patch);
        return user;
      })
  },
  scores: {
    forUser: (userId: string) =>
      readStore()
        .scores.filter((score) => score.userId === userId)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    all: () => readStore().scores,
    add: (userId: string, scoreValue: number, date: string) =>
      mutate((store) => {
        if (store.scores.some((score) => score.userId === userId && score.date === date)) {
          throw new Error("A score already exists for that date.");
        }

        const score: Score = {
          id: id("score"),
          userId,
          score: scoreValue,
          date,
          createdAt: todayIso()
        };

        store.scores.push(score);
        const userScores = store.scores
          .filter((item) => item.userId === userId)
          .sort((a, b) => b.date.localeCompare(a.date));

        userScores.slice(5).forEach((oldScore) => {
          const index = store.scores.findIndex((item) => item.id === oldScore.id);
          if (index >= 0) store.scores.splice(index, 1);
        });

        return score;
      }),
    update: (scoreId: string, patch: Partial<Pick<Score, "score" | "date">>) =>
      mutate((store) => {
        const score = store.scores.find((item) => item.id === scoreId);
        if (!score) return undefined;
        if (patch.date && store.scores.some((item) => item.userId === score.userId && item.date === patch.date && item.id !== scoreId)) {
          throw new Error("A score already exists for that date.");
        }
        Object.assign(score, patch);
        return score;
      })
  },
  charities: {
    all: () => readStore().charities,
    findById: (charityId: string) => readStore().charities.find((charity) => charity.id === charityId),
    create: (input: Omit<Charity, "id">) =>
      mutate((store) => {
        const charity = { ...input, id: id("charity") };
        store.charities.push(charity);
        return charity;
      }),
    delete: (charityId: string) =>
      mutate((store) => {
        const index = store.charities.findIndex((charity) => charity.id === charityId);
        if (index < 0) return false;
        store.charities.splice(index, 1);
        return true;
      })
  },
  subscriptions: {
    all: () => readStore().subscriptions,
    forUser: (userId: string) => readStore().subscriptions.find((subscription) => subscription.userId === userId),
    upsert: (input: Omit<Subscription, "id">) =>
      mutate((store) => {
        const existing = store.subscriptions.find((subscription) => subscription.userId === input.userId);
        if (existing) {
          Object.assign(existing, input);
          return existing;
        }
        const subscription = { ...input, id: id("sub") };
        store.subscriptions.push(subscription);
        return subscription;
      }),
    updateStatus: (userId: string, status: SubscriptionStatus) =>
      mutate((store) => {
        const user = store.users.find((item) => item.id === userId);
        if (user) user.subscriptionStatus = status;
        const subscription = store.subscriptions.find((item) => item.userId === userId);
        if (subscription) subscription.status = status;
        return { user, subscription };
      })
  },
  draws: {
    all: () => readStore().draws.sort((a, b) => b.month.localeCompare(a.month)),
    create: (input: Omit<Draw, "id" | "createdAt">) =>
      mutate((store) => {
        const draw = { ...input, id: id("draw"), createdAt: todayIso() };
        store.draws.push(draw);
        return draw;
      }),
    update: (drawId: string, patch: Partial<Draw>) =>
      mutate((store) => {
        const draw = store.draws.find((item) => item.id === drawId);
        if (!draw) return undefined;
        Object.assign(draw, patch);
        return draw;
      })
  },
  winnings: {
    all: () => readStore().winnings,
    forUser: (userId: string) => readStore().winnings.filter((winning) => winning.userId === userId),
    createMany: (items: Omit<Winning, "id" | "createdAt">[]) =>
      mutate((store) => {
        const created = items.map((item) => ({ ...item, id: id("win"), createdAt: todayIso() }));
        store.winnings.push(...created);
        return created;
      }),
    updateStatus: (winningId: string, status: WinningStatus) =>
      mutate((store) => {
        const winning = store.winnings.find((item) => item.id === winningId);
        if (!winning) return undefined;
        winning.status = status;
        winning.reviewedAt = todayIso();
        return winning;
      }),
    attachProof: (winningId: string, proofUrl: string) =>
      mutate((store) => {
        const winning = store.winnings.find((item) => item.id === winningId);
        if (!winning) return undefined;
        winning.proofUrl = proofUrl;
        winning.status = "pending";
        return winning;
      })
  }
};
