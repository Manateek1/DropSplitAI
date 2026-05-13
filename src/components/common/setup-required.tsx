import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function SetupRequired({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12">
      <Card className="border-amber-200 bg-amber-50 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.22)]">
        <CardContent className="space-y-4 p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Production setup required</h1>
            <p className="mt-2 text-sm leading-6 text-slate-700">{message}</p>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Add the missing environment variables in Vercel or enable explicit demo mode for a demo deployment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
