"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function loginUrl(message: string) {
  const params = new URLSearchParams({ message });
  return `/login?${params.toString()}`;
}

function getCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  return { email, password };
}

function validateCredentials(email: string, password: string) {
  if (!email || !password) {
    redirect(loginUrl("Email and password are required."));
  }

  if (password.length < 6) {
    redirect(loginUrl("Password must be at least 6 characters."));
  }
}

export async function signIn(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect(loginUrl("Supabase environment variables are not configured."));
  }

  const { email, password } = getCredentials(formData);
  validateCredentials(email, password);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(loginUrl(error.message));
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect(loginUrl("Supabase environment variables are not configured."));
  }

  const { email, password } = getCredentials(formData);
  validateCredentials(email, password);

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined
    }
  });

  if (error) {
    redirect(loginUrl(error.message));
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect(loginUrl("Check your email to confirm your account."));
}

export async function signOut() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
