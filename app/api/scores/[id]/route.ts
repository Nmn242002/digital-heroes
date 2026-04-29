import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { repository } from "@/lib/db/repository";
import { updateScore } from "@/lib/services/scores";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  if ("status" in user) return user;
  const { id } = await context.params;
  const existing = repository.scores.all().find((score) => score.id === id);
  if (!existing || (existing.userId !== user.id && user.role !== "admin")) return json({ error: "Score not found." }, 404);

  try {
    const body = await request.json();
    const score = updateScore(id, Number(body.score), String(body.date ?? existing.date));
    return json({ score });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Could not update score." }, 400);
  }
}
