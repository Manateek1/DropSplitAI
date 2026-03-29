"use server";

import { redirect } from "next/navigation";

import { env, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthActionResult } from "@/types/domain";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema, type ForgotPasswordInput, type LoginInput, type ResetPasswordInput, type SignupInput } from "@/lib/validation";

export async function loginAction(values: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your login info." };
  }

  if (!isSupabaseConfigured) {
    return { ok: true, redirectTo: "/dashboard", message: "Demo mode is active." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, redirectTo: "/dashboard" };
}

export async function signupAction(values: SignupInput): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your sign up info." };
  }

  if (!isSupabaseConfigured) {
    return { ok: true, redirectTo: "/onboarding", message: "Demo mode is active." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${env.appUrl}/auth/callback`,
      data: { first_name: parsed.data.firstName },
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: parsed.data.email,
      first_name: parsed.data.firstName,
      full_name: parsed.data.firstName,
    });
  }

  return {
    ok: true,
    redirectTo: data.session ? "/onboarding" : "/login",
    message: data.session ? "Account created." : "Check your email to confirm your account.",
  };
}

export async function forgotPasswordAction(values: ForgotPasswordInput): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  }

  if (!isSupabaseConfigured) {
    return { ok: true, message: "Demo mode is active. Configure Supabase to send reset emails." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.appUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Password reset email sent." };
}

export async function updatePasswordAction(values: ResetPasswordInput): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Use a stronger password." };
  }

  if (!isSupabaseConfigured) {
    return { ok: true, redirectTo: "/login", message: "Demo mode is active." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, redirectTo: "/dashboard", message: "Password updated." };
}

export async function signOutAction() {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
