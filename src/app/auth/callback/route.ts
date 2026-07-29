import { NextResponse, type NextRequest } from "next/server";

import { hasSupabasePublicEnv } from "@/lib/env";
import { getSafeRedirectUrl } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

function loginErrorUrl(requestUrl: URL, message: string) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("message", message);
  return loginUrl;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextUrl = getSafeRedirectUrl(requestUrl, requestUrl.searchParams.get("next"));

  if (!hasSupabasePublicEnv()) {
    return NextResponse.redirect(
      loginErrorUrl(requestUrl, "Supabase environment variables are not configured.")
    );
  }

  if (!code) {
    return NextResponse.redirect(
      loginErrorUrl(requestUrl, "Authentication link is invalid or expired.")
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      loginErrorUrl(requestUrl, "Authentication link is invalid or expired.")
    );
  }

  return NextResponse.redirect(nextUrl);
}
