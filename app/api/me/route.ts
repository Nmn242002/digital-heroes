import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { repository } from "@/lib/db/repository";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if ("status" in user) return user;

  return json({
    user,
    scores: repository.scores.forUser(user.id),
    subscription: repository.subscriptions.forUser(user.id),
    charity: repository.charities.findById(user.charityId),
    winnings: repository.winnings.forUser(user.id),
    draws: repository.draws.all()
  });
}
