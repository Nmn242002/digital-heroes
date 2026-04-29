import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { repository } from "@/lib/db/repository";
import { addScore } from "@/lib/services/scores";
import { hasActiveSubscription } from "@/lib/services/subscriptions";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if ("status" in user) return user;
  return json({ scores: repository.scores.forUser(user.id) });
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if ("status" in user) return user;
  if (!hasActiveSubscription(user.id)) return json({ error: "An active subscription is required." }, 402);

  try {
    const body = await request.json();
    const score = addScore(user.id, Number(body.score), String(body.date ?? ""));
    return json({ score }, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Could not add score." }, 400);
  }
}
