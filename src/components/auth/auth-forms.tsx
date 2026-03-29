"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { forgotPasswordAction, loginAction, signupAction, updatePasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema, type ForgotPasswordInput, type LoginInput, type ResetPasswordInput, type SignupInput } from "@/lib/validation";

function AuthShell({ title, description, children, footer }: { title: string; description: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Card className="border-slate-200 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.28)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl tracking-tight text-slate-950">{title}</CardTitle>
        <CardDescription className="text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
        {footer}
      </CardContent>
    </Card>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await loginAction(values);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to log in.");
        return;
      }
      toast.success(result.message ?? "Logged in.");
      router.push(result.redirectTo ?? "/dashboard");
      router.refresh();
    });
  });

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your coach chat, weekly plan, and swim tracking dashboard."
      footer={<p className="text-sm text-slate-500">No account yet? <Link className="font-medium text-slate-950" href="/signup">Sign up</Link></p>}
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link href="/forgot-password" className="text-sm font-medium text-slate-500 hover:text-slate-950">Forgot?</Link>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await signupAction(values);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to create account.");
        return;
      }
      toast.success(result.message ?? "Account created.");
      router.push(result.redirectTo ?? "/onboarding");
      router.refresh();
    });
  });

  return (
    <AuthShell
      title="Start free"
      description="Tell DropSplit AI about your swimming, then get a personalized weekly plan and coach-style chat."
      footer={<p className="text-sm text-slate-500">Already have an account? <Link className="font-medium text-slate-950" href="/login">Log in</Link></p>}
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input placeholder="Dillon" autoComplete="given-name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await forgotPasswordAction(values);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to send reset email.");
        return;
      }
      toast.success(result.message ?? "Reset email sent.");
    });
  });

  return (
    <AuthShell title="Reset password" description="Enter the email tied to your account and we&apos;ll send a reset link.">
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "" } });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updatePasswordAction(values);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to update password.");
        return;
      }
      toast.success(result.message ?? "Password updated.");
      router.push(result.redirectTo ?? "/dashboard");
      router.refresh();
    });
  });

  return (
    <AuthShell title="Choose a new password" description="Use a password you do not use anywhere else.">
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
