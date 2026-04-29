import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#17201b]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f5f1ea]/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#12352f] text-sm font-semibold text-[#f6e7bd] shadow-lg shadow-emerald-950/10">DC</span>
            <span className="text-sm font-semibold tracking-tight">DrawClub</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#52645d] md:flex">
            <Link href="/charities" className="hover:text-[#17201b]">Charities</Link>
            <Link href="/dashboard" className="hover:text-[#17201b]">Dashboard</Link>
            {user?.role === "admin" ? <Link href="/admin" className="hover:text-[#17201b]">Admin</Link> : null}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <form action="/api/auth/logout" method="post">
                <button className="rounded-lg border border-[#12352f]/20 bg-white/60 px-3 py-2 text-sm font-medium hover:bg-white">Sign out</button>
              </form>
            ) : (
              <Link href="/auth" className="rounded-lg bg-[#12352f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-950/15 hover:bg-[#0d2824]">
                Subscribe
              </Link>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
