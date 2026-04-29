"use client";

import { useMemo, useState } from "react";
import type { Charity } from "@/lib/types";

export default function AuthForm({ charities }: { charities: Charity[] }) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const defaultCharity = useMemo(() => charities[0]?.id ?? "", [charities]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      credentials: "include", // 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Something went wrong.");
      return;
    }

    // 🔥 FIX: full reload so server reads cookie properly
    window.location.href = "/dashboard";
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/86 p-6 shadow-xl shadow-emerald-950/10 backdrop-blur">
      <div className="grid grid-cols-2 rounded-xl bg-[#e7f2ee] p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-lg px-3 py-2 ${
            mode === "signup" ? "bg-white shadow-sm" : "text-[#65736c]"
          }`}
        >
          Sign up
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-3 py-2 ${
            mode === "login" ? "bg-white shadow-sm" : "text-[#65736c]"
          }`}
        >
          Log in
        </button>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            defaultValue={mode === "login" ? "member@drawclub.local" : ""}
            className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-3 outline-none focus:border-[#b47738]"
            required
          />
        </label>

        <label className="block text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            defaultValue={mode === "login" ? "member123" : ""}
            className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-3 outline-none focus:border-[#b47738]"
            required
          />
        </label>

        {mode === "signup" && (
          <>
            <label className="block text-sm font-medium">
              Charity
              <select
                name="charityId"
                defaultValue={defaultCharity}
                className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-3 outline-none focus:border-[#b47738]"
              >
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Charity contribution %
              <input
                name="charityContributionPercent"
                type="number"
                min="10"
                max="100"
                defaultValue="10"
                className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-3 outline-none focus:border-[#b47738]"
              />
            </label>
          </>
        )}

        {message && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#12352f] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/15 disabled:opacity-60"
        >
          {loading
            ? "Working..."
            : mode === "signup"
            ? "Create account"
            : "Log in"}
        </button>
      </form>
    </div>
  );
}