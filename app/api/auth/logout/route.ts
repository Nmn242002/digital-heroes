import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseRouteClient,
  isSupabaseAuthConfigured,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);

  if (isSupabaseAuthConfigured()) {
    const supabase = createSupabaseRouteClient(request, response);
    await supabase?.auth.signOut();
  }

  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
