import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { toPublicUser } from "@/lib/auth";
import { repository } from "@/lib/db/repository";
import { getAnalytics } from "@/lib/services/analytics";

export async function GET(request: NextRequest) {
  const user = await requireUser(request, "admin");
  if ("status" in user) return user;

  return json({
    users: repository.users.all().map(toPublicUser),
    scores: repository.scores.all(),
    subscriptions: repository.subscriptions.all(),
    charities: repository.charities.all(),
    draws: repository.draws.all(),
    winnings: repository.winnings.all(),
    analytics: getAnalytics()
  });
}
