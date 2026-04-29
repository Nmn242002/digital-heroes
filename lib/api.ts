import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import type { PublicUser, Role } from "@/lib/types";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function requireUser(request: NextRequest, role?: Role): Promise<PublicUser | NextResponse> {
  const user = await getSessionFromRequest(request);
  if (!user) return json({ error: "Authentication required." }, 401);
  if (role && user.role !== role) return json({ error: "Insufficient permissions." }, 403);
  return user;
}
