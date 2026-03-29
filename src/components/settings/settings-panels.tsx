"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { DashboardData } from "@/types/domain";

export function SettingsPanels({ dashboardData }: { dashboardData: DashboardData }) {
  const [textTones, setTextTones] = useState(true);
  const [easierRecovery, setEasierRecovery] = useState(true);

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
              <Input defaultValue={dashboardData.user.firstName} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input defaultValue={dashboardData.user.email} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Weekly swim days</label>
              <Input defaultValue={String(dashboardData.swimmerProfile.weeklySwimDays)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Favorite strokes</label>
              <Input defaultValue={dashboardData.swimmerProfile.favoriteStrokes.join(", ")} />
            </div>
            <div className="sm:col-span-2">
              <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => toast.success("Profile settings saved.")}>Save settings</Button>
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
