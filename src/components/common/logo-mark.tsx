import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#14D8E6,#0FB8C6)] shadow-[0_12px_24px_rgba(20,216,230,0.24)]">
        <svg viewBox="0 0 40 40" className="h-6 w-6 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 24C11 24 11 16 15 16C19 16 19 24 23 24C27 24 27 16 31 16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M9 29C13 29 13 21 17 21C21 21 21 29 25 29C29 29 29 21 33 21" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" opacity="0.75" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-500">Swim Coach AI</p>
        <p className="text-base font-semibold tracking-tight text-slate-950">DropSplit AI</p>
      </div>
    </div>
  );
}
