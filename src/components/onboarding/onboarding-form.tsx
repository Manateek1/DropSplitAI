"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { saveOnboardingAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_TYPES, SWIM_EVENTS } from "@/lib/constants";
import { onboardingSchema, type OnboardingSchemaInput } from "@/lib/validation";
import { cn } from "@/lib/utils";

const steps = [
  { key: "basics", title: "Basics", description: "Give the coach enough context to tailor the plan." },
  { key: "events", title: "Events and times", description: "Capture strokes, best events, and current times." },
  { key: "training", title: "Schedule", description: "Set weekly swim availability and pool access." },
  { key: "goals", title: "Goals", description: "Tell the coach what you want to improve next." },
] as const;

const strokeOptions = ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "IM"];
const weaknessOptions = ["Turns", "Starts", "Underwaters", "Pacing", "Race confidence", "Stroke timing", "Finishing speed"];

function ChipSelect({ label, options, values, toggle }: { label: string; options: string[]; values: string[]; toggle: (value: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition",
                active
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950",
              )}
            >
              {active ? <Check className="h-3.5 w-3.5" /> : null}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OnboardingForm({ defaultValues }: { defaultValues: OnboardingSchemaInput }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const form = useForm<OnboardingSchemaInput>({
    resolver: zodResolver(onboardingSchema) as Resolver<OnboardingSchemaInput>,
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "bestTimes" });

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const values = useWatch({ control: form.control });

  const nextStep = async () => {
    const keysByStep: Array<Array<keyof OnboardingSchemaInput>> = [
      ["firstName", "age", "gradeGroup", "skillLevel", "heightInInches", "weightLbs"],
      ["favoriteStrokes", "bestEvents", "bestTimes", "weaknesses"],
      ["weeklySwimDays", "poolAccess", "currentTrainingLevel", "sorenessNotes"],
      ["goals", "targetEvents"],
    ];

    const valid = await form.trigger(keysByStep[step], { shouldFocus: true });
    if (valid) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
    }
  };

  const toggleArrayValue = (key: "favoriteStrokes" | "bestEvents" | "weaknesses" | "goals" | "targetEvents", value: string) => {
    const current = values[key] as string[];
    form.setValue(
      key,
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
      { shouldValidate: true },
    );
  };

  const submit = form.handleSubmit((formValues) => {
    startTransition(async () => {
      const result = await saveOnboardingAction(formValues);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to save onboarding.");
        return;
      }
      toast.success(result.message ?? "Your plan is ready.");
      router.push(result.redirectTo ?? "/dashboard");
      router.refresh();
    });
  });

  return (
    <Card className="border-slate-200 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.28)]">
      <CardHeader className="space-y-5 border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl tracking-tight text-slate-950">Set up your coach profile</CardTitle>
            <CardDescription className="mt-2 text-slate-500">Smooth, low-friction onboarding that turns into a personalized weekly swim plan.</CardDescription>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            Step {step + 1} of {steps.length}
          </div>
        </div>
        <div className="space-y-3">
          <Progress value={progress} className="h-2 rounded-full bg-slate-100" />
          <div className="grid gap-2 sm:grid-cols-4">
            {steps.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  index === step
                    ? "border-cyan-400 bg-cyan-50"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form className="space-y-8" onSubmit={submit}>
            {step === 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl><Input placeholder="Dillon" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="skillLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Choose level" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl><Input type="number" placeholder="16" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gradeGroup" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade or age group</FormLabel>
                    <FormControl><Input placeholder="10th grade" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="heightInInches" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (inches)</FormLabel>
                    <FormControl><Input type="number" placeholder="70" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="weightLbs" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (lbs)</FormLabel>
                    <FormControl><Input type="number" placeholder="150" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                <ChipSelect
                  label="Favorite strokes"
                  options={strokeOptions}
                  values={values.favoriteStrokes ?? []}
                  toggle={(value) => toggleArrayValue("favoriteStrokes", value)}
                />
                <ChipSelect
                  label="Current best events"
                  options={[...SWIM_EVENTS]}
                  values={values.bestEvents ?? []}
                  toggle={(value) => toggleArrayValue("bestEvents", value)}
                />
                <ChipSelect
                  label="What feels hardest right now?"
                  options={weaknessOptions}
                  values={values.weaknesses ?? []}
                  toggle={(value) => toggleArrayValue("weaknesses", value)}
                />
                <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">Best times</h3>
                      <p className="text-sm text-slate-500">Add a couple current times so the first plan feels personal.</p>
                    </div>
                    <Button type="button" variant="outline" className="rounded-2xl" onClick={() => append({ event: "50 free", time: "", course: "SCY" })}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add time
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1.2fr_0.8fr_0.6fr_auto]">
                        <FormField control={form.control} name={`bestTimes.${index}.event`} render={({ field }) => (
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
                        <FormField control={form.control} name={`bestTimes.${index}.time`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl><Input placeholder="55.88" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`bestTimes.${index}.course`} render={({ field }) => (
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
                        <Button type="button" variant="ghost" className="self-end rounded-2xl text-slate-500 hover:text-rose-500" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="weeklySwimDays" render={({ field }) => (
                  <FormItem>
                    <FormLabel>How many days do you usually swim?</FormLabel>
                    <FormControl><Input type="number" min={1} max={7} placeholder="5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="poolAccess" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pool access</FormLabel>
                    <FormControl><Input placeholder="School team + Saturday lane" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentTrainingLevel" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Current training level</FormLabel>
                    <FormControl><Input placeholder="High school in-season, plus optional Saturday practice" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sorenessNotes" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Soreness or fatigue tendencies</FormLabel>
                    <FormControl><Textarea placeholder="Shoulders get tight after back-to-back sprint days." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <ChipSelect
                  label="Target events"
                  options={[...SWIM_EVENTS]}
                  values={values.targetEvents ?? []}
                  toggle={(value) => toggleArrayValue("targetEvents", value)}
                />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Goals</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["Drop 3 seconds in my 100 free", "Pick my best race events", "Understand sets better", "Improve turns", "Get faster in breaststroke", "Race with more confidence"].map((goal) => {
                      const active = (values.goals ?? []).includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleArrayValue("goals", goal)}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left text-sm font-medium transition",
                            active ? "border-cyan-400 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                          )}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage>{form.formState.errors.goals?.message}</FormMessage>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0 || pending}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-3">
                {step < steps.length - 1 ? (
                  <Button type="button" className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={nextStep}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" disabled={pending}>
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Build my plan"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
