import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { repository } from "@/lib/services/mockDataStore";
import type { PublicUser, Role, User } from "@/lib/types";

export const SESSION_COOKIE = "drawclub_session";

const encoder = new TextEncoder();

type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
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
    await crypto.subtle.digest("SHA-256", encoder.encode(`${secret()}:${password}`))
  );
}

export async function verifyPassword(password: string, passwordHash: string) {
  return (await hashPassword(password)) === passwordHash;
}

// ---------------- USER HELPERS ----------------

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

// ---------------- SESSION ----------------

export async function getCurrentUser() {
  const cookieStore = await cookies(); // ✅ FIXED

  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifyToken(token);

  if (!session) return null;

  const user = repository.users.findById(session.sub);
  return user ? toPublicUser(user) : null;
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifyToken(token);

  if (!session) return null;

  const user = repository.users.findById(session.sub);
  return user ? toPublicUser(user) : null;
}

// ---------------- COOKIE CONFIG ----------------

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: true, // REQUIRED for Vercel
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}