export default function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/78 p-5 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d7665]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#17201b]">{value}</p>
      {detail ? <p className="mt-2 text-sm text-[#65736c]">{detail}</p> : null}
    </div>
  );
}
