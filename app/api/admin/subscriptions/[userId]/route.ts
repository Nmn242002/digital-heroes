import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { repository } from "@/lib/services/mockDataStore";
import type { SubscriptionStatus } from "@/lib/types";

export async function PATCH(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const admin = await requireUser(request, "admin");
  if ("status" in admin) return admin;
  const { userId } = await context.params;
  const body = await request.json();
  const status = String(body.status ?? "") as SubscriptionStatus;
  if (!["active", "expired", "cancelled"].includes(status)) return json({ error: "Invalid subscription status." }, 400);
  const result = repository.subscriptions.updateStatus(userId, status);
  return result.user ? json(result) : json({ error: "User not found." }, 404);
}
