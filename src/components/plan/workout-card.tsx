import { Clock3, Waves } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutDay, WorkoutSection } from "@/types/domain";

function SectionBlock({ title, sections }: { title: string; sections?: WorkoutSection[] }) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h4>
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={`${section.title}-${index}`} className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-950">{section.reps}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {section.interval ? <span className="rounded-full bg-slate-100 px-2.5 py-1">Send-off {section.interval}</span> : null}
                {section.rest ? <span className="rounded-full bg-slate-100 px-2.5 py-1">Rest {section.rest}</span> : null}
                {section.yardage ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{section.yardage} yds</span> : null}
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{section.details}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-700">Focus: {section.focus}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkoutCard({ day }: { day: WorkoutDay }) {
  return (
    <Card className="border-slate-200 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.24)]">
      <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl tracking-tight text-slate-950">{day.label}</CardTitle>
            <Badge className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50">{day.focus}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">{day.coachNote}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5"><Waves className="h-4 w-4" /> {day.strokeFocus}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5"><Clock3 className="h-4 w-4" /> {day.totalYardage.toLocaleString()} yds</span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 sm:p-6">
        <SectionBlock title="Warmup" sections={day.warmup} />
        <SectionBlock title="Pre-set" sections={day.preSet} />
        <SectionBlock title="Main set" sections={day.mainSet} />
        <SectionBlock title="Kick" sections={day.kick} />
        <SectionBlock title="Pull" sections={day.pull} />
        <SectionBlock title="Drill" sections={day.drill} />
        <SectionBlock title="Cooldown" sections={day.cooldown} />
        <SectionBlock title="Optional dryland" sections={day.dryland} />
      </CardContent>
    </Card>
  );
}
