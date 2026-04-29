"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Charity } from "@/lib/types";

export default function CharityManager({ charities }: { charities: Charity[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/charities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        location: form.get("location"),
        description: form.get("description"),
        impact: form.get("impact"),
        focusAreas: String(form.get("focusAreas") ?? "Community support").split(",").map((item) => item.trim()).filter(Boolean)
      })
    });
    setMessage(response.ok ? "Charity added." : "Could not add charity.");
    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  async function remove(id: string) {
    const response = await fetch(`/api/admin/charities?id=${id}`, { method: "DELETE" });
    setMessage(response.ok ? "Charity deleted." : "Could not delete charity.");
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-black/10 bg-[#f8f4ec] p-4 md:grid-cols-2">
        <input name="name" placeholder="Charity name" required className="rounded-lg border border-black/15 px-3 py-2 text-sm" />
        <input name="location" placeholder="Location" required className="rounded-lg border border-black/15 px-3 py-2 text-sm" />
        <input name="focusAreas" placeholder="Focus areas, comma separated" className="rounded-lg border border-black/15 px-3 py-2 text-sm md:col-span-2" />
        <textarea name="description" placeholder="Description" required className="min-h-20 rounded-lg border border-black/15 px-3 py-2 text-sm md:col-span-2" />
        <textarea name="impact" placeholder="Impact statement" required className="min-h-20 rounded-lg border border-black/15 px-3 py-2 text-sm md:col-span-2" />
        <button className="rounded-lg bg-[#12352f] px-4 py-2 text-sm font-bold text-white md:col-span-2">Add charity</button>
      </form>
      {message ? <p className="rounded-lg bg-[#e7f2ee] px-3 py-2 text-sm text-[#31544c]">{message}</p> : null}
      <div className="grid gap-3 md:grid-cols-3">
        {charities.map((charity) => (
          <div key={charity.id} className="rounded-xl border border-black/10 bg-[#f8f4ec] p-4">
            <p className="font-medium">{charity.name}</p>
            <p className="mt-1 text-sm text-[#65736c]">{charity.location}</p>
            <button type="button" onClick={() => remove(charity.id)} className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
