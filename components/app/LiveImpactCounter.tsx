"use client";

import { useEffect, useState } from "react";

export default function LiveImpactCounter({ base, label }: { base: number; label: string }) {
  const [delta, setDelta] = useState(0);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 40));
    const interval = window.setInterval(() => {
      setDelta((current) => {
        const drift = Math.round(Math.sin(Date.now() / 3500) * 18);
        const movement = Math.floor(Math.random() * 17) - 4;
        return Math.max(0, current + movement + drift);
      });
    }, 1400);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-xl shadow-black/20 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f6e7bd]">{label}</p>
      <p className="mt-3 text-5xl font-semibold tracking-tight">GBP {(base + seed + delta).toLocaleString("en-GB")}</p>
      <div className="mt-3 flex items-center gap-2 text-sm text-white/75">
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        Live today estimate
      </div>
    </div>
  );
}
