import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { repository } from "@/lib/services/mockDataStore";
import type { CookieOptions } from "@supabase/ssr";
import type { PublicUser, Role, SubscriptionStatus, User } from "@/lib/types";

export const SESSION_COOKIE = "drawclub_session";

const encoder = new TextEncoder();

type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
  subscriptionStatus: User["subscriptionStatus"];
  charityId: string;
  charityContributionPercent: number;
  exp: number;
};

const base64Url = (input: ArrayBuffer | string) => {
  const bytes =
    typeof input === "string"
      ? encoder.encode(input)
      : new Uint8Array(input);
  return Buffer.from(bytes).toString("base64url");
};

const secret = () =>
  process.env.JWT_SECRET ?? "dev-secret-change-me";

const passwordPepper = () =>
  process.env.PASSWORD_PEPPER ?? "drawclub-password-v1";

export const isSupabaseAuthConfigured = () =>
  Boolean(supabaseAuthConfig());

const supabaseAuthConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
};

// ---------------- SIGN / VERIFY ----------------

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return base64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export async function createToken(user: User) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));

  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      charityId: user.charityId,
      charityContributionPercent: user.charityContributionPercent,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    } satisfies SessionPayload)
  );

  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${await sign(unsigned)}`;
}

export async function verifyToken(token?: string) {
  if (!token) return null;

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const expected = await sign(`${header}.${payload}`);
  if (signature !== expected) return null;

  const session = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8")
  ) as SessionPayload;

  if (session.exp < Math.floor(Date.now() / 1000)) return null;

  return session;
}

// ---------------- PASSWORD ----------------

export async function hashPassword(password: string) {
  return base64Url(
    await crypto.subtle.digest("SHA-256", encoder.encode(`${passwordPepper()}:${password}`))
  );
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (
    (passwordHash === "demo-member" && password === "member123") ||
    (passwordHash === "demo-admin" && password === "admin123")
  ) {
    return true;
  }

  return (await hashPassword(password)) === passwordHash;
}

// ---------------- USER HELPERS ----------------

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function sessionToPublicUser(session: SessionPayload): PublicUser {
  return {
    id: session.sub,
    email: session.email,
    role: session.role,
    subscriptionStatus: session.subscriptionStatus,
    charityId: session.charityId,
    charityContributionPercent: session.charityContributionPercent,
    createdAt: new Date(session.exp * 1000).toISOString(),
  };
}

function supabaseUserToPublicUser(user: {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}): PublicUser {
  const metadata = user.user_metadata ?? {};
  const appMetadata = user.app_metadata ?? {};
  const role = appMetadata.role === "admin" ? "admin" : "user";
  const subscriptionStatus =
    metadata.subscriptionStatus === "active" ||
    metadata.subscriptionStatus === "cancelled"
      ? metadata.subscriptionStatus
      : "expired";

  return {
    id: user.id,
    email: user.email ?? "",
    role,
    subscriptionStatus: subscriptionStatus as SubscriptionStatus,
    charityId:
      typeof metadata.charityId === "string"
        ? metadata.charityId
        : repository.charities.all()[0]?.id ?? "",
    charityContributionPercent:
      typeof metadata.charityContributionPercent === "number"
        ? metadata.charityContributionPercent
        : Number(metadata.charityContributionPercent ?? 10),
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

export function createSupabaseRouteClient(
  request: NextRequest,
  response: NextResponse
) {
  const config = supabaseAuthConfig();
  if (!config) return null;

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });
}

async function getSupabaseCurrentUser() {
  const config = supabaseAuthConfig();
  if (!config) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        } catch {
          // Server Components cannot always write refreshed cookies.
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return supabaseUserToPublicUser(user);
}

// ---------------- SESSION ----------------

export async function getCurrentUser() {
  const supabaseUser = await getSupabaseCurrentUser();
  if (supabaseUser) return supabaseUser;

  const cookieStore = await cookies(); // ✅ FIXED

  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifyToken(token);

  if (!session) return null;

  const user = repository.users.findById(session.sub);
  return user ? toPublicUser(user) : sessionToPublicUser(session);
}

export async function getSessionFromRequest(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createSupabaseRouteClient(request, response);

  if (supabase) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) return supabaseUserToPublicUser(user);
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifyToken(token);

  if (!session) return null;

  const user = repository.users.findById(session.sub);
  return user ? toPublicUser(user) : sessionToPublicUser(session);
}

// ---------------- COOKIE CONFIG ----------------

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
