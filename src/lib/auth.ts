import { redirect } from "next/navigation";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  if (!hasSupabasePublicEnv()) {
    redirect("/login?message=Supabase%20environment%20variables%20are%20not%20configured");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
