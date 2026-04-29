import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { repository } from "@/lib/db/repository";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  if ("status" in user) return user;
  const { id } = await context.params;
  const winning = repository.winnings.all().find((item) => item.id === id);
  if (!winning || winning.userId !== user.id) return json({ error: "Winning not found." }, 404);
  const body = await request.json();
  const proofUrl = String(body.proofUrl ?? "").trim();
  if (!proofUrl) return json({ error: "Proof URL or note is required." }, 400);
  return json({ winning: repository.winnings.attachProof(id, proofUrl) });
}
