import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseRouteClient,
  createToken,
  hashPassword,
  isSupabaseAuthConfigured,
  SESSION_COOKIE,
  sessionCookieOptions,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { repository } from "@/lib/services/mockDataStore";
import { queueEmailNotification } from "@/lib/services/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const charityId = String(body.charityId ?? "");
    const charityContributionPercent = Number(
      body.charityContributionPercent ?? 10
    );

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

    if (isSupabaseAuthConfigured()) {
      const response = NextResponse.json({ ok: true }, { status: 201 });
      const supabase = createSupabaseRouteClient(request, response);

      if (!supabase) {
        return NextResponse.json(
          { error: "Supabase authentication is not configured." },
          { status: 500 }
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            charityId,
            charityContributionPercent,
            subscriptionStatus: "expired",
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already")) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError) return response;
        }

        return NextResponse.json(
          { error: error.message || "Could not create account." },
          { status: 400 }
        );
      }

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          return NextResponse.json(
            {
              error:
                "Account created, but email confirmation is required before logging in.",
            },
            { status: 403 }
          );
        }
      }

      return response;
    }

    if (repository.users.findByEmail(email)) {
      const existingUser = repository.users.findByEmail(email);
      if (
        existingUser &&
        (await verifyPassword(password, existingUser.passwordHash))
      ) {
        const token = await createToken(existingUser);
        const response = NextResponse.json({
          user: toPublicUser(existingUser),
        });

        response.cookies.set({
          name: SESSION_COOKIE,
          value: token,
          ...sessionCookieOptions(),
        });

        return response;
      }

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
      ...sessionCookieOptions(),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create account.",
      },
      { status: 500 }
    );
  }
}
