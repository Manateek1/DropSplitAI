"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ManualTimeEntryDialog } from "@/components/log/manual-time-entry-dialog";
import { UploadDropzone } from "@/components/log/upload-dropzone";
import { ProgressChartCard } from "@/components/dashboard/progress-chart-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import type { DashboardData, SwimLog, UploadedFileRecord } from "@/types/domain";

export function SwimLogView({ dashboardData }: { dashboardData: DashboardData }) {
  const [logs, setLogs] = useState<SwimLog[]>(dashboardData.swimLogs);
  const [uploading, setUploading] = useState(false);
  const recentTimes = logs.flatMap((log) => log.timeEntries);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Swim log and progress</h2>
          <p className="mt-1 text-sm text-slate-500">Track time drops, consistency, and what the coach is noticing.</p>
        </div>
        <ManualTimeEntryDialog
          onSubmit={(entry) => {
            setLogs((current) => [
              {
                id: `manual-${Date.now()}`,
                date: entry.date,
                yardage: 0,
                durationMinutes: 0,
                type: entry.context,
                note: entry.note,
                timeEntries: [
                  {
                    id: `time-${Date.now()}`,
                    event: entry.event,
                    course: entry.course,
                    time: entry.time,
                    timeSeconds: entry.time.includes(":")
                      ? Number(entry.time.split(":")[0]) * 60 + Number(entry.time.split(":")[1])
                      : Number(entry.time),
                    date: entry.date,
                    context: entry.context,
                    note: entry.note,
                    source: "manual",
                  },
                ],
              },
              ...current,
            ]);
            toast.success(`${entry.event} logged.`);
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressChartCard title="Event progress" description="50 free trend since joining" data={dashboardData.progressSeries} suffix="s" />
        <ProgressChartCard title="Swim frequency" description="Days swum per week" data={dashboardData.frequencySeries} suffix=" days" />
      </div>

      <UploadDropzone
        pending={uploading}
        onUpload={async (file) => {
          setUploading(true);
          const formData = new FormData();
          formData.append("file", file);
          try {
            const response = await fetch("/api/files/upload", { method: "POST", body: formData });
            const payload = (await response.json()) as { file?: UploadedFileRecord; error?: string };
            if (!response.ok || !payload.file) {
              throw new Error(payload.error ?? "Upload failed.");
            }
            toast.success(`${payload.file.fileName} uploaded.`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed.");
          } finally {
            setUploading(false);
          }
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="border-slate-200 shadow-[0_18px_60px_-44px_rgba(15,23,42,0.18)]">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg tracking-tight text-slate-950">{log.type === "meet" ? "Meet" : "Practice"} · {log.date}</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">{log.note ?? "No notes yet."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{log.yardage.toLocaleString()} yds</Badge>
                  <Badge className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50">{log.durationMinutes || 0} min</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {log.timeEntries.length ? log.timeEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-slate-950">{entry.event} · {entry.time}</p>
                        <p className="mt-1 text-sm text-slate-500">{entry.context} · {entry.course}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{entry.source}</p>
                    </div>
                    {entry.note ? <p className="mt-2 text-sm leading-6 text-slate-500">{entry.note}</p> : null}
                  </div>
                )) : <p className="text-sm text-slate-500">No times logged on this swim yet.</p>}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-slate-200 shadow-[0_18px_60px_-44px_rgba(15,23,42,0.18)]">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight text-slate-950">Quick read</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-950">Personal bests</p>
              <div className="mt-2 space-y-2">
                {dashboardData.bestTimes.map((time) => (
                  <div key={time.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
                    <span>{time.event}</span>
                    <span className="font-semibold text-slate-950">{time.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Recent entries</p>
              <p className="mt-2 leading-6">{recentTimes.length} logged time entries since joining. The biggest trend is steady sprint free improvement and better event consistency.</p>
            </div>
            {dashboardData.coachNotes[0] ? (
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                <p className="font-semibold text-slate-950">Coach note</p>
                <p className="mt-2 leading-6 text-slate-600">{dashboardData.coachNotes[0].body}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{formatRelativeTime(dashboardData.coachNotes[0].createdAt)}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
