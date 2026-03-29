import Link from "next/link";

import { LoginForm } from "@/components/auth/auth-forms";
import { LogoMark } from "@/components/common/logo-mark";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:grid lg:grid-cols-[460px_minmax(0,1fr)] lg:items-center">
        <div className="space-y-6 rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(20,216,230,0.16),_transparent_55%),#0f172a] p-8 text-white shadow-[0_30px_80px_-48px_rgba(15,23,42,0.4)]">
          <LogoMark className="[&_p:last-child]:text-white [&_p:first-child]:text-cyan-200" />
          <div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight">Coach chat, plans, and time drops in one place.</h1>
            <p className="mt-3 text-sm leading-7 text-white/70">Built for serious middle school and high school swimmers who want more personalized coaching without adding friction.</p>
          </div>
          <div className="rounded-[24px] bg-white/8 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Need an account?</p>
            <Link href="/signup" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white">Start free</Link>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
