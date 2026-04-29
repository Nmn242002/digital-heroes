import { NextRequest, NextResponse } from "next/server";
import {
  createToken,
  hashPassword,
  SESSION_COOKIE,
  toPublicUser,
} from "@/lib/auth";
import { repository } from "@/lib/services/mockDataStore";
import { queueEmailNotification } from "@/lib/services/notifications";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const charityId = String(body.charityId ?? "");
  const charityContributionPercent = Number(body.charityContributionPercent ?? 10);

  if (!email || password.length < 8) {
    return NextResponse.json(
      { error: "Email and an 8+ character password are required." },
      { status: 400 }
    );
  }

  if (!repository.charities.findById(charityId)) {
    return NextResponse.json(
      { error: "Select a valid charity." },
      { status: 400 }
    );
  }

  if (charityContributionPercent < 10 || charityContributionPercent > 100) {
    return NextResponse.json(
      { error: "Charity contribution must be between 10 and 100 percent." },
      { status: 400 }
    );
  }

  if (repository.users.findByEmail(email)) {
    return NextResponse.json(
      { error: "An account already exists for that email." },
      { status: 409 }
    );
  }

  const user = repository.users.create({
    email,
    passwordHash: await hashPassword(password),
    role: "user",
    subscriptionStatus: "expired",
    charityId,
    charityContributionPercent,
  });

  queueEmailNotification({
    to: user.email,
    subject: "Welcome to DrawClub",
    body: "Your account is ready. Activate a subscription to enter monthly draws.",
  });

  const token = await createToken(user);

  const response = NextResponse.json(
    { user: toPublicUser(user) },
    { status: 201 }
  );


  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "none", // 
    secure: true,     // 
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}