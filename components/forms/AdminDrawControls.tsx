"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDrawControls() {
  const router = useRouter();
  const [mode, setMode] = useState("weighted");
  const [result, setResult] = useState<string>("");

  async function call(path: string) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    });
    const data = await response.json();
    setResult(JSON.stringify(data.simulation ?? data.draw, null, 2));
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/82 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <select value={mode} onChange={(event) => setMode(event.target.value)} className="rounded-lg border border-black/15 px-3 py-2 text-sm">
          <option value="weighted">Algorithm weighted</option>
          <option value="random">Random</option>
        </select>
        <button type="button" onClick={() => call("/api/draws/simulate")} className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold">Simulate</button>
        <button type="button" onClick={() => call("/api/admin/draws/publish")} className="rounded-lg bg-[#12352f] px-4 py-2 text-sm font-bold text-white">Publish draw</button>
      </div>
      {result ? <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-[#102d28] p-4 text-xs text-[#f6e7bd]">{result}</pre> : null}
    </div>
  );
}
