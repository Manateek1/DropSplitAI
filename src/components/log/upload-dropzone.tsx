"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

export function UploadDropzone({ onUpload, pending }: { onUpload: (file: File) => Promise<void> | void; pending?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-left transition hover:border-slate-400 hover:bg-white"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.2)]">
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Upload meet results, a pace sheet, or a practice board</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">Images only for the MVP. The coach can summarize likely results and help log them.</p>
          </div>
        </div>
        <Button type="button" variant="outline" className="rounded-2xl border-slate-200">Choose file</Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          void onUpload(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
