"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateAccountSettingsAction } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { DashboardData } from "@/types/domain";

export function SettingsPanels({ dashboardData }: { dashboardData: DashboardData }) {
  const [pending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState(dashboardData.user.firstName);
  const [weeklySwimDays, setWeeklySwimDays] = useState(String(dashboardData.swimmerProfile.weeklySwimDays || 1));
  const [favoriteStrokes, setFavoriteStrokes] = useState(dashboardData.swimmerProfile.favoriteStrokes.join(", "));
  const [textTones, setTextTones] = useState(dashboardData.swimmerProfile.prefersSimpleExplanations);
  const [easierRecovery, setEasierRecovery] = useState(dashboardData.swimmerProfile.autoEasyOnSoreness);

  const saveSettings = () => {
    startTransition(async () => {
      const result = await updateAccountSettingsAction({
        firstName,
        weeklySwimDays: Number(weeklySwimDays),
        favoriteStrokes,
        prefersSimpleExplanations: textTones,
        autoEasyOnSoreness: easierRecovery,
      });

      if (!result.ok) {
        toast.error(result.message ?? "Unable to save settings.");
        return;
      }

      toast.success(result.message ?? "Settings saved.");
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.18)]">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight text-slate-950">Profile</CardTitle>
            <CardDescription>Update the swimmer details the coach uses most often.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First name</label>
              <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input defaultValue={dashboardData.user.email} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Weekly swim days</label>
              <Input value={weeklySwimDays} onChange={(event) => setWeeklySwimDays(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Favorite strokes</label>
              <Input value={favoriteStrokes} onChange={(event) => setFavoriteStrokes(event.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button className="rounded-lg bg-slate-950 text-white hover:bg-slate-800" onClick={saveSettings} disabled={pending}>
                Save settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.18)]">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight text-slate-950">Coach preferences</CardTitle>
            <CardDescription>Control how the AI coach communicates and adjusts workouts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-950">Text me simple explanations</p>
                <p className="mt-1 text-sm text-slate-500">Keep set explanations short and teen-friendly.</p>
              </div>
              <Switch checked={textTones} onCheckedChange={setTextTones} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-950">Adjust easier when I mention soreness</p>
                <p className="mt-1 text-sm text-slate-500">Prioritize recovery unless I explicitly ask to keep intensity.</p>
              </div>
              <Switch checked={easierRecovery} onCheckedChange={setEasierRecovery} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
