"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4">
          <Card className="max-w-lg border-slate-200 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.24)]">
            <CardContent className="space-y-4 p-6">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Something went wrong</h1>
              <p className="text-sm leading-6 text-slate-600">
                DropSplit AI could not load this page. Try again, and if it keeps happening, check the server logs for
                this request.
              </p>
              {error.digest ? <p className="text-xs text-slate-500">Error ID: {error.digest}</p> : null}
              <Button onClick={reset} className="rounded-lg bg-slate-950 text-white hover:bg-slate-800">Try again</Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
