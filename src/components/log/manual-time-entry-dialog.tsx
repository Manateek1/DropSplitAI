"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COURSE_TYPES, SWIM_EVENTS } from "@/lib/constants";
import { manualTimeEntrySchema, type ManualTimeEntryInput } from "@/lib/validation";

export function ManualTimeEntryDialog({ onSubmit }: { onSubmit: (entry: ManualTimeEntryInput) => Promise<void> | void }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<ManualTimeEntryInput>({
    resolver: zodResolver(manualTimeEntrySchema),
    defaultValues: {
      event: "50 free",
      course: "SCY",
      time: "",
      date: new Date().toISOString().slice(0, 10),
      context: "practice",
      note: "",
    },
  });

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      await onSubmit(values);
      form.reset({ ...values, time: "", note: "" });
    });
  });

  return (
    <Dialog>
      <DialogTrigger render={<Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" />}>
        <Plus className="mr-2 h-4 w-4" />
        Log a swim
      </DialogTrigger>
      <DialogContent className="border-slate-200 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Manual time entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="event" render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {SWIM_EVENTS.map((event) => <SelectItem key={event} value={event}>{event}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="course" render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {COURSE_TYPES.map((course) => <SelectItem key={course} value={course}>{course}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl><Input placeholder="55.88" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="context" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="meet">Meet</SelectItem>
                      <SelectItem value="time-trial">Time trial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="note" render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl><Input placeholder="Great turns, messy finish" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="submit" className="w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save entry"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
