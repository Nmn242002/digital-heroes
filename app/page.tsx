import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/app/AppShell";
import Metric from "@/components/app/Metric";
import { repository } from "@/lib/services/mockDataStore";
import { getAnalytics } from "@/lib/services/analytics";

const heroVideo = "https://videos.pexels.com/video-files/853870/853870-hd_1920_1080_25fps.mp4";

const images = {
  member: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
  impact: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
  dashboard: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
};

export default function Home() {
  const analytics = getAnalytics();
  const charities = repository.charities.all();

  return (
    <AppShell>
      <main>
        <section className="relative isolate overflow-hidden bg-[#102d28] text-white">
          <video className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45" autoPlay muted loop playsInline poster={images.member}>
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,45,40,0.96),rgba(16,45,40,0.68),rgba(16,45,40,0.36))]" />
          <div className="mx-auto grid min-h-[88vh] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.86fr] lg:px-8">
            <div>
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#f6e7bd] backdrop-blur">
                Stableford rewards with real charity impact
              </p>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
                A monthly draw club that makes every round feel bigger.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                Track your latest scores, stay eligible through subscription, join a monthly draw, and route part of the upside to a cause you choose.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/auth" className="rounded-xl bg-[#f6e7bd] px-5 py-3 text-sm font-bold text-[#102d28] shadow-xl shadow-black/20 hover:bg-white">
                  Start membership
                </Link>
                <Link href="/dashboard" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/18">
                  View dashboard
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/12 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="rounded-xl bg-[#f8f4ec] p-5 text-[#17201b]">
                <div className="flex items-center justify-between text-sm text-[#65736c]">
                  <span>Live prize model</span>
                  <span>Algorithm weighted</span>
                </div>
                <div className="mt-7 grid grid-cols-5 gap-2">
                  {[9, 18, 27, 36, 42].map((number) => (
                    <div key={number} className="grid aspect-square place-items-center rounded-xl bg-[#12352f] text-xl font-bold text-[#f6e7bd]">{number}</div>
                  ))}
                </div>
                <div className="mt-7 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white p-3"><p className="text-2xl font-semibold">40%</p><p className="text-xs text-[#65736c]">Jackpot</p></div>
                  <div className="rounded-lg bg-white p-3"><p className="text-2xl font-semibold">35%</p><p className="text-xs text-[#65736c]">4-match</p></div>
                  <div className="rounded-lg bg-white p-3"><p className="text-2xl font-semibold">25%</p><p className="text-xs text-[#65736c]">3-match</p></div>
                </div>
                <div className="mt-5 rounded-lg bg-[#e7f2ee] p-4 text-sm text-[#31544c]">
                  No 5-match winner? The jackpot rolls forward automatically.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Current prize pool" value={`GBP ${analytics.totalPrizePool}`} detail="Generated from active subscriptions." />
            <Metric label="Charity pledged" value={`GBP ${analytics.charityContributions}`} detail="Minimum 10% impact contribution." />
            <Metric label="Active members" value={String(analytics.activeSubscriptions)} detail="Eligible for this month." />
          </div>
        </section>

        <section className="bg-[#ebe3d5]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="relative min-h-[420px] overflow-hidden rounded-2xl">
              <Image src={images.dashboard} alt="Modern product dashboard workspace" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
            </div>
            <div className="grid content-center gap-4">
              {[
                ["01", "Score", "Enter dated Stableford points from 1 to 45. The system keeps only the last five."],
                ["02", "Subscribe", "Monthly or yearly plans unlock score submission, draw eligibility, and payout records."],
                ["03", "Win and give", "Prize tiers split the pool while each member keeps a visible charity pledge."]
              ].map(([number, title, copy]) => (
                <div key={title} className="rounded-xl border border-black/10 bg-white/70 p-5 shadow-sm">
                  <p className="text-sm font-bold text-[#b47738]">{number}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
                  <p className="mt-2 text-[#65736c]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b47738]">Impact partners</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight">Choose the charity behind your membership.</h2>
              <p className="mt-4 text-[#65736c]">The product is built to make giving part of the main workflow, not an afterthought hidden on a receipt.</p>
              <div className="relative mt-8 h-72 overflow-hidden rounded-2xl">
                <Image src={images.impact} alt="Community charity support" fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
            </div>
            <div className="grid gap-4">
              {charities.map((charity) => (
                <Link href={`/charities/${charity.id}`} key={charity.id} className="rounded-xl border border-black/10 bg-white/78 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b47738] hover:shadow-lg">
                  <p className="text-xl font-semibold">{charity.name}</p>
                  <p className="mt-2 text-sm font-medium text-[#b47738]">{charity.location}</p>
                  <p className="mt-3 leading-7 text-[#65736c]">{charity.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
