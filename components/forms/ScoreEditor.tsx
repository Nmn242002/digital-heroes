"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Score } from "@/lib/types";

export default function ScoreEditor({ scores }: { scores: Score[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function save(score: Score, formData: FormData) {
    const response = await fetch(`/api/scores/${score.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const data = await response.json();
    setMessage(response.ok ? "Score updated." : data.error ?? "Could not update score.");
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-3">
      {message ? <p className="rounded-lg bg-[#e7f2ee] px-3 py-2 text-sm text-[#31544c]">{message}</p> : null}
      {scores.map((score) => (
        <form
          key={score.id}
          onSubmit={(event) => {
            event.preventDefault();
            save(score, new FormData(event.currentTarget));
          }}
          className="grid gap-3 rounded-xl border border-black/10 bg-[#f8f4ec] p-3 sm:grid-cols-[1fr_120px_auto]"
        >
          <input name="date" type="date" defaultValue={score.date} className="rounded-lg border border-black/15 px-3 py-2 text-sm" />
          <input name="score" type="number" min="1" max="45" defaultValue={score.score} className="rounded-lg border border-black/15 px-3 py-2 text-sm" />
          <button className="rounded-lg bg-[#12352f] px-4 py-2 text-sm font-bold text-white">Save</button>
        </form>
      ))}
    </div>
  );
}
