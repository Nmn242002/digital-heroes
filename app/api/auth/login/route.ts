import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseRouteClient,
  createToken,
  isSupabaseAuthConfigured,
  SESSION_COOKIE,
  sessionCookieOptions,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { repository } from "@/lib/services/mockDataStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (isSupabaseAuthConfigured()) {
      const response = NextResponse.json({ ok: true });
      const supabase = createSupabaseRouteClient(request, response);

      if (!supabase) {
        return NextResponse.json(
          { error: "Supabase authentication is not configured." },
          { status: 500 }
        );
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json(
          { error: error.message || "Invalid email or password." },
          { status: 401 }
        );
      }

      return response;
    }

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

    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      ...sessionCookieOptions(),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to log in.",
      },
      { status: 500 }
    );
  }
}
