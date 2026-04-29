"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionPlan } from "@/lib/types";

export default function SubscribeButton({ plan }: { plan: SubscriptionPlan }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function checkout() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/subscriptions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "Checkout failed.");
      return;
    }
    if (data.checkout?.url) {
      window.location.href = data.checkout.url;
      return;
    }
    setMessage(data.checkout?.message ?? "Subscription activated.");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={checkout} disabled={loading} className="rounded-xl bg-[#12352f] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/15 hover:bg-[#0d2824] disabled:opacity-60">
        {loading ? "Opening checkout..." : `Activate ${plan}`}
      </button>
      {message ? <p className="max-w-xs text-xs text-teal-800">{message}</p> : null}
    </div>
  );
}
