import { NextRequest, NextResponse } from "next/server";
import {
  createToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { repository } from "@/lib/services/mockDataStore";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const user = repository.users.findByEmail(email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = await createToken(user);

  const response = NextResponse.json({
    user: toPublicUser(user),
  });

  // 🔥 CRITICAL FIX
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    ...sessionCookieOptions(),
  });

  return response;
}
