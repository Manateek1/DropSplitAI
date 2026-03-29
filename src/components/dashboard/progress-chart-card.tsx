"use client";

import { useSyncExternalStore } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartPoint } from "@/types/domain";

export function ProgressChartCard({ title, description, data, suffix = "" }: { title: string; description: string; data: ChartPoint[]; suffix?: string }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  return (
    <Card className="border-slate-200 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.18)]">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight text-slate-950">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} width={44} />
                <Tooltip
                  cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }}
                  contentStyle={{ borderRadius: 16, borderColor: "#E2E8F0", boxShadow: "0 18px 40px -30px rgba(15,23,42,0.2)" }}
                  formatter={(value) => [`${value ?? ""}${suffix}`, title]}
                />
                <Line type="monotone" dataKey="value" stroke="#14D8E6" strokeWidth={3} dot={{ r: 4, fill: "#14D8E6" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-[24px] bg-[linear-gradient(180deg,rgba(20,216,230,0.08),rgba(226,232,240,0.32))]" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
