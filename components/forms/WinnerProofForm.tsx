"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WinnerProofForm({ winningId }: { winningId?: string }) {
  const router = useRouter();
  const [proofUrl, setProofUrl] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!winningId) {
      setMessage("Proof upload becomes available after a winning result.");
      return;
    }
    const response = await fetch(`/api/winnings/${winningId}/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proofUrl })
    });
    const data = await response.json();
    setMessage(response.ok ? "Proof submitted for admin review." : data.error ?? "Could not submit proof.");
    if (response.ok) router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <input value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="Paste screenshot URL or proof note" className="w-full rounded-xl border border-black/15 px-3 py-3 text-sm outline-none focus:border-[#b47738]" />
      <button className="w-full rounded-xl border border-dashed border-[#12352f]/30 bg-[#e7f2ee] px-4 py-3 text-sm font-semibold text-[#31544c]">
        Submit proof
      </button>
      {message ? <p className="text-sm text-[#65736c]">{message}</p> : null}
    </form>
  );
}
