"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScoreForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const data = await response.json();
    setMessage(response.ok ? "Score saved." : data.error ?? "Could not save score.");
    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/10 bg-white/82 p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium">
          Stableford score
          <input name="score" type="number" min="1" max="45" required className="mt-2 w-full rounded-lg border border-black/15 px-3 py-3 outline-none focus:border-[#b47738]" />
        </label>
        <label className="text-sm font-medium">
          Date
          <input name="date" type="date" required className="mt-2 w-full rounded-lg border border-black/15 px-3 py-3 outline-none focus:border-[#b47738]" />
        </label>
        <button className="self-end rounded-xl bg-[#12352f] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/15">Add score</button>
      </div>
      {message ? <p className="mt-3 rounded-lg bg-[#e7f2ee] px-3 py-2 text-sm text-[#31544c]">{message}</p> : null}
    </form>
  );
}
