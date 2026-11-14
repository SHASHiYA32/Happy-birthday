"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { emailSchema, passwordSchema, safeNext } from "@/lib/security/validation";

export type AuthState = { error?: string; notice?: string } | undefined;

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  // Same message for every failure so attackers can't tell which emails exist.
  const generic = { error: "That email and password don't match." };
  if (!email.success || password.length < 1 || password.length > 72) return generic;

  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 20, 10 * 60_000) || !rateLimit(`login:${email.data}`, 8, 10 * 60_000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password });
  if (error) return generic;

  redirect(next);
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!email.success) return { error: "Enter a valid email address." };
  if (!password.success) return { error: password.error.issues[0]?.message ?? "Choose a stronger password." };

  const ip = await clientIp();
  if (!rateLimit(`signup:${ip}`, 5, 60 * 60_000)) {
    return { error: "Too many sign-ups from this network. Try again later." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email: email.data, password: password.data });
  if (error) return { error: "We couldn't create that account. Try a different email or password." };

  // With email confirmation enabled there is no session yet.
  if (!data.session) {
    return { notice: "Almost there. Check your inbox and confirm your email, then log in." };
  }
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
