import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { repository } from "@/lib/db/repository";
import { publishDraw } from "@/lib/services/draws";
import { queueEmailNotification } from "@/lib/services/notifications";
import type { DrawMode } from "@/lib/types";

export async function POST(request: NextRequest) {
  const user = await requireUser(request, "admin");
  if ("status" in user) return user;
  const body = await request.json();
  const mode = String(body.mode ?? "weighted") as DrawMode;
  if (!["random", "weighted"].includes(mode)) return json({ error: "Invalid draw mode." }, 400);
  const result = publishDraw(mode);
  result.winnings.forEach((winning) => {
    const winner = repository.users.findById(winning.userId);
    if (winner) {
      queueEmailNotification({
        to: winner.email,
        subject: "DrawClub result published",
        body: `You matched ${winning.matchType} for GBP ${winning.amount}. Submit proof from your dashboard.`
      });
    }
  });
  return json(result, 201);
}
