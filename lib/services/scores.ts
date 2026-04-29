import { repository } from "@/lib/db/repository";

export function validateStablefordScore(score: number) {
  return Number.isInteger(score) && score >= 1 && score <= 45;
}

export function addScore(userId: string, score: number, date: string) {
  if (!validateStablefordScore(score)) {
    throw new Error("Stableford score must be an integer from 1 to 45.");
  }
  if (!date || Number.isNaN(Date.parse(date))) {
    throw new Error("A valid score date is required.");
  }
  return repository.scores.add(userId, score, date);
}

export function updateScore(scoreId: string, score: number, date: string) {
  if (!validateStablefordScore(score)) {
    throw new Error("Stableford score must be an integer from 1 to 45.");
  }
  return repository.scores.update(scoreId, { score, date });
}
