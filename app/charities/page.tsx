import Image from "next/image";
import AppShell from "@/components/app/AppShell";
import CharityDirectory from "@/components/forms/CharityDirectory";
import { repository } from "@/lib/services/mockDataStore";

export default function CharitiesPage() {
  const charities = repository.charities.all();

  return (
    <AppShell>
      <main>
        <section className="relative overflow-hidden bg-[#102d28] text-white">
          <Image src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1600&q=80" alt="People volunteering together" fill className="object-cover opacity-35" sizes="100vw" priority />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f6e7bd]">Charity partners</p>
            <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight">Your membership starts with a cause.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
              Search the charity directory, filter by focus area, and open a profile to see live impact numbers, events, and contribution context.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <CharityDirectory charities={charities} />
        </section>
      </main>
    </AppShell>
  );
}
