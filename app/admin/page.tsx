import Image from "next/image";
import { redirect } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import Metric from "@/components/app/Metric";
import AdminDrawControls from "@/components/forms/AdminDrawControls";
import CharityManager from "@/components/forms/CharityManager";
import SubscriptionStatusActions from "@/components/forms/SubscriptionStatusActions";
import WinnerActions from "@/components/forms/WinnerActions";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { repository } from "@/lib/services/mockDataStore";
import { getAnalytics } from "@/lib/services/analytics";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (user.role !== "admin") redirect("/dashboard");

  const analytics = getAnalytics();
  const users = repository.users.all().map(toPublicUser);
  const winnings = repository.winnings.all();

  return (
    <AppShell>
      <main>
        <section className="relative overflow-hidden bg-[#102d28] text-white">
          <Image src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80" alt="Analytics dashboard" fill className="object-cover opacity-30" sizes="100vw" priority />
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f6e7bd]">Admin control</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight">Operations dashboard</h1>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Total users" value={String(analytics.totalUsers)} />
            <Metric label="Prize pool" value={`GBP ${analytics.totalPrizePool}`} />
            <Metric label="Charity" value={`GBP ${analytics.charityContributions}`} />
            <Metric label="Pending payouts" value={String(analytics.pendingPayouts)} />
          </div>

          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Run draw</h2>
            <AdminDrawControls />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white/82 p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Users and subscriptions</h2>
              <div className="mt-4 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.16em] text-[#65736c]">
                    <tr><th className="py-2">Email</th><th>Role</th><th>Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">{item.email}</td>
                        <td>{item.role}</td>
                        <td><SubscriptionStatusActions userId={item.id} currentStatus={item.subscriptionStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/82 p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Winner verification</h2>
              <div className="mt-4 divide-y divide-black/10">
                {winnings.map((winning) => (
                  <div key={winning.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{winning.matchType} - GBP {winning.amount}</p>
                      <p className="text-[#65736c]">{winning.status}</p>
                      {winning.proofUrl ? <p className="mt-1 text-xs text-[#31544c]">Proof: {winning.proofUrl}</p> : null}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="rounded-lg bg-[#e7f2ee] px-2 py-1 text-xs text-[#31544c]">{winning.userId}</span>
                      <WinnerActions winningId={winning.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-black/10 bg-white/82 p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Charities</h2>
            <div className="mt-4">
              <CharityManager charities={repository.charities.all()} />
            </div>
          </section>
        </section>
      </main>
    </AppShell>
  );
}
