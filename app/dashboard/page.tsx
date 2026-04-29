import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import Metric from "@/components/app/Metric";
import ScoreForm from "@/components/forms/ScoreForm";
import ScoreEditor from "@/components/forms/ScoreEditor";
import SubscribeButton from "@/components/forms/SubscribeButton";
import WinnerProofForm from "@/components/forms/WinnerProofForm";
import { getCurrentUser } from "@/lib/auth";
import { repository } from "@/lib/services/mockDataStore";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  const scores = repository.scores.forUser(user.id);
  const subscription = repository.subscriptions.forUser(user.id);
  const charity = repository.charities.findById(user.charityId);
  const winnings = repository.winnings.forUser(user.id);
  const proofWinning = winnings.find((winning) => winning.status !== "paid");
  const draws = repository.draws.all();
  const totalWinnings = winnings.reduce((sum, winning) => sum + winning.amount, 0);
  const nextDrawMonth = new Date().toISOString().slice(0, 7);

  return (
    <AppShell>
      <main>
        <section className="relative overflow-hidden bg-[#102d28] text-white">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
            alt="Modern city glass architecture"
            fill
            className="object-cover opacity-25"
            sizes="100vw"
            priority
          />
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f6e7bd]">
              Member dashboard
            </p>
            <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 className="max-w-2xl text-5xl font-semibold tracking-tight">
                  Your monthly position
                </h1>
                <p className="mt-3 text-white/72">{user.email}</p>
              </div>
              <Link
                href="/charities"
                className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/18"
              >
                Browse charities
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric
              label="Subscription"
              value={user.subscriptionStatus}
              detail={
                subscription
                  ? `${subscription.plan} - renews ${subscription.currentPeriodEnd.slice(0, 10)}`
                  : "Activate to enter draws."
              }
            />
            <Metric
              label="Scores stored"
              value={`${scores.length}/5`}
              detail="Reverse chronological order."
            />
            <Metric
              label="Charity pledge"
              value={`${user.charityContributionPercent}%`}
              detail={charity?.name}
            />
            <Metric
              label="Winnings"
              value={`GBP ${totalWinnings}`}
              detail={`${winnings.length} recorded results`}
            />
          </div>

          {user.subscriptionStatus !== "active" && (
            <section className="mt-8 rounded-2xl border border-[#12352f]/15 bg-[#e7f2ee] p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">
                Activate your subscription
              </h2>
              <p className="mt-2 text-sm text-[#31544c]">
                Stripe Checkout opens automatically when `STRIPE_SECRET_KEY` is
                configured. Otherwise this runs a visible mock checkout for the
                demo.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <SubscribeButton plan="monthly" />
                <SubscribeButton plan="yearly" />
              </div>
            </section>
          )}

          <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Score entry
              </h2>
              <p className="mt-2 text-sm text-[#65736c]">
                Enter Stableford points from 1 to 45.
              </p>
              <div className="mt-4">
                <ScoreForm />
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/78 p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Edit last 5 scores</h2>
              <div className="mt-4">
                {scores.length ? (
                  <ScoreEditor scores={scores} />
                ) : (
                  <p className="py-6 text-sm text-[#65736c]">
                    No scores yet.
                  </p>
                )}
              </div>
            </div>
          </section>
        </section>
      </main>
    </AppShell>
  );
}
