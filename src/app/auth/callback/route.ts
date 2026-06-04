import { NextResponse, type NextRequest } from "next/server";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!hasSupabasePublicEnv()) {
    return NextResponse.redirect(
      new URL("/login?message=Supabase%20environment%20variables%20are%20not%20configured", request.url)
    );
  }

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
