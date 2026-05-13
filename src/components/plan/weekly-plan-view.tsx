"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { adjustWorkoutDayAction, updateWorkoutCompletionAction } from "@/actions/plan";
import { WorkoutCard } from "@/components/plan/workout-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WeeklyPlan } from "@/types/domain";

export function WeeklyPlanView({ plan }: { plan: WeeklyPlan }) {
  const [days, setDays] = useState(plan.days);
  const [selectedDayId, setSelectedDayId] = useState(plan.days[0]?.id);
  const [pending, startTransition] = useTransition();

  const selectedDay = useMemo(() => days.find((day) => day.id === selectedDayId) ?? days[0], [days, selectedDayId]);

  const updateDay = (mutate: (day: WeeklyPlan["days"][number]) => WeeklyPlan["days"][number]) => {
    if (!selectedDay) return;
    setDays((current) => current.map((day) => (day.id === selectedDay.id ? mutate(day) : day)));
  };

  const adjustDay = (adjustment: "easier" | "harder" | "swap-focus") => {
    if (!selectedDay) return;

    startTransition(async () => {
      const result = await adjustWorkoutDayAction(selectedDay, adjustment);
      if (!result.ok || !result.day) {
        toast.error(result.message ?? "Unable to adjust workout.");
        return;
      }

      setDays((current) => current.map((day) => (day.id === result.day?.id ? result.day : day)));
      toast.success(result.message ?? "Workout adjusted.");
    });
  };

  const toggleCompleted = () => {
    if (!selectedDay) return;
    const nextCompleted = !selectedDay.completed;

    startTransition(async () => {
      const result = await updateWorkoutCompletionAction(selectedDay.id, nextCompleted);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to update workout.");
        return;
      }

      updateDay((day) => ({ ...day, completed: nextCompleted }));
      toast.success(result.message ?? "Workout updated.");
    });
  };

  if (!days.length || !selectedDay) {
    return (
      <Card className="border-slate-200 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.24)]">
        <CardContent className="p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-600">Weekly plan</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">No plan yet</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Complete onboarding to generate the first week. Once a plan exists, workout adjustments and completion status
            will persist here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.24)]">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-600">Week of {plan.weekOf}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{plan.strokeFocus}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{plan.coachSummary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-100">{plan.totalPlannedYardage.toLocaleString()} yds planned</Badge>
            <Badge className="rounded-full border-cyan-200 bg-cyan-50 px-3 py-1.5 text-cyan-700 hover:bg-cyan-50">{plan.targetSwimDays} swim days</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <Button
            key={day.id}
            type="button"
            variant={day.id === selectedDay.id ? "default" : "outline"}
            className={day.id === selectedDay.id ? "rounded-full bg-slate-950 text-white hover:bg-slate-800" : "rounded-full border-slate-200 text-slate-600"}
            onClick={() => setSelectedDayId(day.id)}
          >
            {day.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="rounded-full border-slate-200" onClick={() => toast.message("Plan regeneration is queued for the next coaching release.")}>Regenerate workout</Button>
        <Button type="button" variant="outline" className="rounded-full border-slate-200" onClick={() => adjustDay("easier")} disabled={pending}>Make easier</Button>
        <Button type="button" variant="outline" className="rounded-full border-slate-200" onClick={() => adjustDay("harder")} disabled={pending}>Make harder</Button>
        <Button type="button" variant="outline" className="rounded-full border-slate-200" onClick={() => adjustDay("swap-focus")} disabled={pending}>Swap focus</Button>
        <Button type="button" variant="outline" className="rounded-full border-slate-200" onClick={() => toast.message(selectedDay.coachNote)}>Explain workout</Button>
        <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={toggleCompleted} disabled={pending}>{selectedDay.completed ? "Mark incomplete" : "Mark complete"}</Button>
      </div>

      <WorkoutCard day={selectedDay} />
    </div>
  );
}
