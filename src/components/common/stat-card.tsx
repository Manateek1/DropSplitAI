import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStat } from "@/types/domain";

export function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <Card className="border-slate-200 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.24)]">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{stat.label}</span>
          {stat.delta ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {stat.delta}
            </span>
          ) : null}
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
          {stat.helper ? <p className="mt-1 text-sm text-slate-500">{stat.helper}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
