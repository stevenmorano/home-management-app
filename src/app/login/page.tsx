import { redirect } from "next/navigation";

import { signIn, signUp } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";

interface LoginPageProps {
  searchParams?: Promise<{
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-4 py-10 text-slate-950">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center">
          <Badge variant="success" className="w-fit">
            Home Management OS
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Sign in to your private property command center.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
            Authentication comes first because addresses, maintenance costs,
            contractor contacts, and home records must stay user-scoped from the beginning.
          </p>
          {!hasSupabasePublicEnv() ? (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Supabase is not configured yet. Copy `.env.example` to `.env.local`,
              then add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
            </div>
          ) : null}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Account Access</CardTitle>
            <CardDescription>
              Use email/password auth for the family-and-friends pilot foundation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {message}
              </div>
            ) : null}

            <form action={signIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sign-in-email">
                  Email
                </label>
                <input
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  id="sign-in-email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sign-in-password">
                  Password
                </label>
                <input
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  id="sign-in-password"
                  name="password"
                  required
                  type="password"
                />
              </div>
              <Button className="w-full" type="submit">
                Sign in
              </Button>
            </form>

            <div className="border-t border-slate-200 pt-6">
              <form action={signUp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="sign-up-email">
                    New account email
                  </label>
                  <input
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    id="sign-up-email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="sign-up-password">
                    New account password
                  </label>
                  <input
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    id="sign-up-password"
                    minLength={6}
                    name="password"
                    required
                    type="password"
                  />
                </div>
                <Button className="w-full" type="submit" variant="outline">
                  Create account
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
