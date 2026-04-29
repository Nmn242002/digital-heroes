import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { simulateDraw } from "@/lib/services/draws";
import type { DrawMode } from "@/lib/types";

export async function POST(request: NextRequest) {
  const user = await requireUser(request, "admin");
  if ("status" in user) return user;
  const body = await request.json();
  const mode = String(body.mode ?? "weighted") as DrawMode;
  if (!["random", "weighted"].includes(mode)) return json({ error: "Invalid draw mode." }, 400);
  return json({ simulation: simulateDraw(mode) });
}
