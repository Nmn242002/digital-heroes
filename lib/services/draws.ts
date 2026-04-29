import { repository } from "@/lib/services/mockDataStore";
import type { DrawMode, MatchType, Score, Winning } from "@/lib/types";

const numberPool = Array.from({ length: 45 }, (_, index) => index + 1);

function uniqueNumbers(seed: number[]) {
  return [...new Set(seed)].slice(0, 5).sort((a, b) => a - b);
}

function randomNumbers() {
  const picked: number[] = [];
  while (picked.length < 5) {
    const number = numberPool[Math.floor(Math.random() * numberPool.length)];
    if (!picked.includes(number)) picked.push(number);
  }
  return picked.sort((a, b) => a - b);
}

function weightedNumbers(scores: Score[]) {
  const recentScores = scores.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
  const weighted = recentScores.flatMap((score) => {
    const influence = Math.max(1, Math.round(score.score / 9));
    return Array.from({ length: influence }, () => score.score);
  });

  const picked = uniqueNumbers(weighted.sort(() => Math.random() - 0.5));
  return picked.length === 5 ? picked : uniqueNumbers([...picked, ...randomNumbers()]);
}

function entryNumbers(scores: Score[]) {
  const values = scores.map((score) => score.score);
  return uniqueNumbers([...values, ...values.map((value) => Math.max(1, value - 3)), ...values.map((value) => Math.min(45, value + 3))]);
}

function matchType(count: number): MatchType | null {
  if (count >= 5) return "5-match";
  if (count === 4) return "4-match";
  if (count === 3) return "3-match";
  return null;
}

function splitPool(match: MatchType, prizePool: number, jackpotRollover: number, winnerCount: number) {
  const pool = match === "5-match" ? prizePool * 0.4 + jackpotRollover : match === "4-match" ? prizePool * 0.35 : prizePool * 0.25;
  return winnerCount ? Number((pool / winnerCount).toFixed(2)) : 0;
}

export function currentPrizePool() {
  return repository.subscriptions
    .all()
    .filter((subscription) => subscription.status === "active")
    .reduce((total, subscription) => total + (subscription.plan === "yearly" ? 180 : 18), 0);
}

export function simulateDraw(mode: DrawMode) {
  const month = new Date().toISOString().slice(0, 7);
  const numbers = mode === "weighted" ? weightedNumbers(repository.scores.all()) : randomNumbers();
  const prizePool = currentPrizePool();
  const previousRollover = repository.draws.all().find((draw) => draw.status === "published")?.rolloverAmount ?? 0;

  const candidates = repository.users
    .all()
    .filter((user) => user.subscriptionStatus === "active")
    .map((user) => {
      const matches = entryNumbers(repository.scores.forUser(user.id)).filter((number) => numbers.includes(number)).length;
      return { user, match: matchType(matches) };
    })
    .filter((candidate): candidate is { user: (typeof candidate)["user"]; match: MatchType } => Boolean(candidate.match));

  const counts = {
    "5-match": candidates.filter((candidate) => candidate.match === "5-match").length,
    "4-match": candidates.filter((candidate) => candidate.match === "4-match").length,
    "3-match": candidates.filter((candidate) => candidate.match === "3-match").length,
    jackpot: 0
  } satisfies Record<MatchType, number>;

  const pendingWinnings = candidates.map((candidate) => ({
    userId: candidate.user.id,
    matchType: candidate.match,
    amount: splitPool(candidate.match, prizePool, previousRollover, counts[candidate.match]),
    status: "pending" as const
  }));

  return {
    month,
    numbers,
    mode,
    prizePool,
    rolloverAmount: counts["5-match"] ? 0 : Number((prizePool * 0.4 + previousRollover).toFixed(2)),
    pendingWinnings
  };
}

export function publishDraw(mode: DrawMode) {
  const simulation = simulateDraw(mode);
  const draw = repository.draws.create({
    month: simulation.month,
    numbers: simulation.numbers,
    mode,
    status: "published",
    prizePool: simulation.prizePool,
    rolloverAmount: simulation.rolloverAmount,
    publishedAt: new Date().toISOString()
  });

  const winnings = repository.winnings.createMany(
    simulation.pendingWinnings.map((winning) => ({
      ...winning,
      drawId: draw.id
    }))
  ) as Winning[];

  return { draw, winnings };
}
