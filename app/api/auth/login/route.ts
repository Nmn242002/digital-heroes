import { NextRequest, NextResponse } from "next/server";
import { createToken, sessionCookieOptions, SESSION_COOKIE, toPublicUser, verifyPassword } from "@/lib/auth";
import { repository } from "@/lib/db/repository";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const user = repository.users.findByEmail(email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ user: toPublicUser(user) });
  response.cookies.set(SESSION_COOKIE, await createToken(user), sessionCookieOptions());
  return response;
}
