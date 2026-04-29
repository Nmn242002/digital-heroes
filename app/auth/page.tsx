import Image from "next/image";
import { redirect } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import AuthForm from "@/components/forms/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { repository } from "@/lib/services/mockDataStore";

export default async function AuthPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AppShell>
      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#b47738]">Membership</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Join the draw with purpose built in.</h1>
          <p className="mt-5 text-lg leading-8 text-[#65736c]">
            Create an account, pick a charity, then activate a monthly or yearly subscription from your dashboard.
          </p>
          <div className="mt-6 rounded-xl border border-black/10 bg-white/70 p-4 text-sm text-[#31544c]">
            Demo user: member@drawclub.local / member123<br />
            Demo admin: admin@drawclub.local / admin123
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden min-h-[560px] overflow-hidden rounded-2xl lg:block">
            <Image src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1000&q=80" alt="Focused member using a laptop" fill className="object-cover" sizes="35vw" />
          </div>
          <AuthForm charities={repository.charities.all()} />
        </div>
      </main>
    </AppShell>
  );
}
