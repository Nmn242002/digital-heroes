"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WinningStatus } from "@/lib/types";

export default function WinnerActions({ winningId }: { winningId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<WinningStatus | null>(null);

  async function update(status: WinningStatus) {
    setLoading(status);
    await fetch(`/api/admin/winnings/${winningId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => update("approved")} disabled={Boolean(loading)} className="rounded-lg bg-[#12352f] px-3 py-2 text-xs font-bold text-white">
        {loading === "approved" ? "..." : "Approve"}
      </button>
      <button type="button" onClick={() => update("rejected")} disabled={Boolean(loading)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
        Reject
      </button>
      <button type="button" onClick={() => update("paid")} disabled={Boolean(loading)} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold text-[#31544c]">
        Mark paid
      </button>
    </div>
  );
}
