"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Charity } from "@/lib/types";

export default function CharityDirectory({ charities }: { charities: Charity[] }) {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState("all");
  const focusAreas = useMemo(() => ["all", ...new Set(charities.flatMap((charity) => charity.focusAreas))], [charities]);

  const filtered = charities.filter((charity) => {
    const text = `${charity.name} ${charity.description} ${charity.location}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesFocus = focus === "all" || charity.focusAreas.includes(focus);
    return matchesQuery && matchesFocus;
  });

  return (
    <div>
      <div className="grid gap-3 rounded-2xl border border-black/10 bg-white/82 p-4 shadow-sm md:grid-cols-[1fr_260px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by charity, location, or mission"
          className="rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#b47738]"
        />
        <select value={focus} onChange={(event) => setFocus(event.target.value)} className="rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#b47738]">
          {focusAreas.map((area) => (
            <option key={area} value={area}>{area === "all" ? "All focus areas" : area}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {filtered.map((charity) => (
          <Link href={`/charities/${charity.id}`} key={charity.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white/82 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b47738] hover:shadow-lg">
            <div className="relative h-48">
              <Image src={charity.imageUrl} alt={charity.name} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
            <div className="p-5">
              <p className="text-xl font-semibold">{charity.name}</p>
              <p className="mt-2 text-sm font-medium text-[#b47738]">{charity.location}</p>
              <p className="mt-4 leading-7 text-[#65736c]">{charity.description}</p>
              <div className="mt-4 flex justify-between rounded-xl bg-[#e7f2ee] px-4 py-3 text-sm text-[#31544c]">
                <span>Raised today</span>
                <span className="font-bold">GBP {charity.raisedTodayBase.toLocaleString("en-GB")}+</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
