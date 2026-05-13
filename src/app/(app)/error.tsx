"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="max-w-lg border-slate-200 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.24)]">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">We could not load this workspace</h2>
          <p className="text-sm leading-6 text-slate-600">
            Your data is safe, but this view hit an error. Try again or come back after a moment.
          </p>
          {error.digest ? <p className="text-xs text-slate-500">Error ID: {error.digest}</p> : null}
          <Button onClick={reset} className="rounded-lg bg-slate-950 text-white hover:bg-slate-800">Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
