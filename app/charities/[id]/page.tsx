import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import LiveImpactCounter from "@/components/app/LiveImpactCounter";
import Metric from "@/components/app/Metric";
import { repository } from "@/lib/services/mockDataStore";

export default async function CharityProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const charity = repository.charities.findById(id);
  if (!charity) notFound();

  const totalMembersSupporting = repository.users.all().filter((user) => user.charityId === charity.id).length;
  const monthlyProjected = repository.users
    .all()
    .filter((user) => user.charityId === charity.id)
    .reduce((sum, user) => sum + (18 * user.charityContributionPercent) / 100, charity.raisedTodayBase * 6);

  return (
    <AppShell>
      <main>
        <section className="relative overflow-hidden bg-[#102d28] text-white">
          <Image src={charity.imageUrl} alt={`${charity.name} community work`} fill className="object-cover opacity-38" sizes="100vw" priority />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,45,40,0.96),rgba(16,45,40,0.72),rgba(16,45,40,0.35))]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.78fr] lg:px-8">
            <div>
              <Link href="/charities" className="text-sm font-semibold text-[#f6e7bd] hover:text-white">Back to charities</Link>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#f6e7bd]">{charity.location} - Founded {charity.founded}</p>
              <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">{charity.name}</h1>
              <p className="mt-6 max-w-2xl text-xl leading-9 text-white/80">{charity.description}</p>
            </div>
            <div className="self-end">
              <LiveImpactCounter base={charity.raisedTodayBase} label="Raised today" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Supporters" value={String(charity.supporters + totalMembersSupporting)} detail="Members and direct donors." />
            <Metric label="Monthly projection" value={`GBP ${Math.round(monthlyProjected).toLocaleString("en-GB")}`} detail="Based on current pledge mix." />
            <Metric label="Minimum pledge" value="10%" detail="Users can increase it at signup." />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-black/10 bg-white/82 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">Impact profile</h2>
              <p className="mt-4 leading-8 text-[#65736c]">{charity.impact}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {charity.focusAreas.map((area) => (
                  <span key={area} className="rounded-xl bg-[#e7f2ee] px-4 py-3 text-sm font-semibold text-[#31544c]">{area}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-[#102d28] p-6 text-white shadow-sm">
              <h2 className="text-2xl font-semibold">Upcoming activity</h2>
              <div className="mt-5 space-y-3">
                {charity.upcomingEvents.map((eventName, index) => (
                  <div key={eventName} className="rounded-xl border border-white/10 bg-white/10 p-4">
                    <p className="text-sm font-semibold text-[#f6e7bd]">Event {index + 1}</p>
                    <p className="mt-1 text-lg font-semibold">{eventName}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-black/10 bg-[#ebe3d5] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b47738]">Independent donation option</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Support without entering a draw.</h2>
            <p className="mt-3 max-w-3xl text-[#65736c]">
              The PRD allows charity giving outside gameplay. This page presents each charity as a standalone impact profile, while member subscriptions continue to route at least 10% automatically.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
