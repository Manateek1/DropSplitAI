"use client";

import { Loader2, Paperclip, SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ChatInput({
  onSend,
  onUpload,
  pending,
  helper,
}: {
  onSend: (message: string) => Promise<void> | void;
  onUpload?: (file: File) => Promise<void> | void;
  pending?: boolean;
  helper?: React.ReactNode;
}) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!message.trim() || pending) return;
    const value = message;
    setMessage("");
    await onSend(value);
  };

  return (
    <div className="space-y-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.24)]">
      {helper}
      <div className="flex items-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-2xl border-slate-200 text-slate-500"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder="Message your coach..."
          className={cn("min-h-[96px] resize-none rounded-2xl border-slate-200 px-4 py-3", pending && "opacity-70")}
        />
        <Button
          type="button"
          className="h-11 w-11 shrink-0 rounded-2xl bg-slate-950 p-0 text-white hover:bg-slate-800"
          onClick={() => void submit()}
          disabled={pending || !message.trim()}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file || !onUpload) return;
          void onUpload(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
