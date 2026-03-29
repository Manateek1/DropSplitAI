import Link from "next/link";
import { ArrowRight, Bot, FileUp, NotebookTabs } from "lucide-react";

import { StatCard } from "@/components/common/stat-card";
import { ProgressChartCard } from "@/components/dashboard/progress-chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const todayWorkout = data.weeklyPlan.days.find((day) => !day.completed) ?? data.weeklyPlan.days[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.dashboardStats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-slate-200 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl tracking-tight text-slate-950">Today&apos;s workout</CardTitle>
              <p className="mt-1 text-sm text-slate-500">{todayWorkout.focus} · {todayWorkout.totalYardage.toLocaleString()} yds</p>
            </div>
            <Link
              href="/plan"
              className={cn(buttonVariants({ variant: "outline", className: "rounded-full border-slate-200" }))}
            >
              View full plan
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Coach note</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{todayWorkout.coachNote}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {todayWorkout.mainSet.slice(0, 2).map((set, index) => (
                <div key={`${set.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">{set.reps}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{set.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight text-slate-950">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/log", label: "Log a swim", icon: FileUp },
              { href: "/chat", label: "Open chat", icon: Bot },
              { href: "/plan", label: "View full plan", icon: NotebookTabs },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    buttonVariants({ variant: "outline", className: "w-full justify-between rounded-2xl border-slate-200 text-slate-700" }),
                  )}
                >
                  <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" /> {action.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ProgressChartCard title="Sprint free trend" description="Recent 50 free performance" data={data.progressSeries} suffix="s" />
        <Card className="border-slate-200 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight text-slate-950">Event insight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">{data.eventInsight.title}</h3>
            <p className="leading-7">{data.eventInsight.description}</p>
            <div>
              <p className="font-semibold text-slate-950">Primary focus</p>
              <p className="mt-2">{data.eventInsight.primaryEvents.join(" · ")}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Secondary options</p>
              <p className="mt-2">{data.eventInsight.secondaryEvents.join(" · ")}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProgressChartCard title="Consistency" description="Swim frequency over recent weeks" data={data.frequencySeries} suffix=" days" />
        <Card className="border-slate-200 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight text-slate-950">Recent coach notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.coachNotes.map((note) => (
              <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-950">{note.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{note.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
