"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionStatus } from "@/lib/types";

export default function SubscriptionStatusActions({ userId, currentStatus }: { userId: string; currentStatus: SubscriptionStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<SubscriptionStatus>(currentStatus);

  async function save(nextStatus: SubscriptionStatus) {
    setStatus(nextStatus);
    await fetch(`/api/admin/subscriptions/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    router.refresh();
  }

  return (
    <select value={status} onChange={(event) => save(event.target.value as SubscriptionStatus)} className="rounded-lg border border-black/15 bg-white px-2 py-1 text-xs">
      <option value="active">active</option>
      <option value="expired">expired</option>
      <option value="cancelled">cancelled</option>
    </select>
  );
}
