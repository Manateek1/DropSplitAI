"use client";

import { Sparkles, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ChatInput } from "@/components/chat/chat-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUGGESTION_CHIPS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import type { ChatMessage, DashboardData, UploadedFileRecord } from "@/types/domain";

export function ChatExperience({ initialMessages, dashboardData }: { initialMessages: ChatMessage[]; dashboardData: DashboardData }) {
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState(false);
  const [uploadState, setUploadState] = useState<{ file?: UploadedFileRecord; uploading: boolean }>({ uploading: false });

  const latestCoachSuggestions = useMemo(
    () => messages.slice().reverse().find((message) => message.role === "assistant")?.suggestions ?? SUGGESTION_CHIPS,
    [messages],
  );

  const sendMessage = async (content: string, uploadedFile?: UploadedFileRecord | null) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
      uploadedFile: uploadedFile ?? undefined,
    };

    setMessages((current) => [...current, userMessage]);
    setPending(true);

    try {
      const response = await fetch("/api/coach/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, uploadedFile }),
      });
      const payload = (await response.json()) as {
        assistantMessage: string;
        followUpSuggestions?: string[];
        actions?: ChatMessage["actions"];
        loggedEntry?: ChatMessage["loggedEntry"];
      };

      if (!response.ok) {
        throw new Error((payload as { error?: string }).error ?? "Unable to reach the coach right now.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.assistantMessage,
          createdAt: new Date().toISOString(),
          suggestions: payload.followUpSuggestions,
          actions: payload.actions,
          loggedEntry: payload.loggedEntry,
        },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reach the coach right now.");
    } finally {
      setPending(false);
      setUploadState({ uploading: false });
    }
  };

  const handleUpload = async (file: File) => {
    setUploadState({ uploading: true });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", { method: "POST", body: formData });
      const payload = (await response.json()) as { file?: UploadedFileRecord; error?: string };
      if (!response.ok || !payload.file) {
        throw new Error(payload.error ?? "Upload failed.");
      }
      setUploadState({ file: payload.file, uploading: false });
      toast.success(`${payload.file.fileName} uploaded.`);
      await sendMessage("I uploaded a screenshot. Can you summarize it and help me use it?", payload.file);
    } catch (error) {
      setUploadState({ uploading: false });
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card className="border-slate-200 shadow-[0_22px_80px_-50px_rgba(15,23,42,0.22)]">
          <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-xl tracking-tight text-slate-950">Coach chat</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Text the coach like you would after practice.</p>
            </div>
            <Badge className="rounded-full border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-700 hover:bg-cyan-50">
              {dashboardData.subscription.messagesUsed}
              {dashboardData.subscription.messageLimit ? ` / ${dashboardData.subscription.messageLimit}` : " used"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {latestCoachSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-200 text-slate-600"
                  onClick={() => void sendMessage(suggestion, uploadState.file)}
                  disabled={pending}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
            <div className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-7 shadow-sm ${message.role === "user" ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-700"}`}>
                    <p>{message.content}</p>
                    {message.loggedEntry ? (
                      <div className="mt-3 rounded-2xl border border-cyan-200 bg-white px-3 py-3 text-slate-700">
                        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-700">
                          <Sparkles className="h-4 w-4" />
                          {message.loggedEntry.event} logged today — {message.loggedEntry.time}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Auto-synced to your swim log and progress tracking.</p>
                      </div>
                    ) : null}
                    <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {formatRelativeTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <ChatInput
          pending={pending || uploadState.uploading}
          onSend={(message) => sendMessage(message, uploadState.file)}
          onUpload={handleUpload}
          helper={
            uploadState.file ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-2 text-sm text-cyan-700">
                <UploadCloud className="h-4 w-4" />
                {uploadState.file.fileName}
              </div>
            ) : null
          }
        />
      </div>
      <div className="space-y-4">
        <Card className="border-slate-200 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.18)]">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight text-slate-950">Coach context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-950">Current focus</p>
              <p className="mt-1 leading-6">{dashboardData.weeklyPlan.strokeFocus}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Goals</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dashboardData.swimmerProfile.goals.map((goal) => (
                  <Badge key={goal} variant="secondary" className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{goal}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Best events</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dashboardData.swimmerProfile.bestEvents.map((event) => (
                  <Badge key={event} className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50">{event}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
