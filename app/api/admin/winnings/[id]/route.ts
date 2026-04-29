import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { repository } from "@/lib/db/repository";
import { queueEmailNotification } from "@/lib/services/notifications";
import type { WinningStatus } from "@/lib/types";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request, "admin");
  if ("status" in user) return user;
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status ?? "") as WinningStatus;
  if (!["pending", "approved", "rejected", "paid"].includes(status)) return json({ error: "Invalid status." }, 400);
  const winning = repository.winnings.updateStatus(id, status);
  if (winning) {
    const winner = repository.users.findById(winning.userId);
    if (winner) {
      queueEmailNotification({
        to: winner.email,
        subject: `Winner status updated: ${status}`,
        body: `Your ${winning.matchType} winning is now ${status}.`
      });
    }
  }
  return winning ? json({ winning }) : json({ error: "Winning not found." }, 404);
}
