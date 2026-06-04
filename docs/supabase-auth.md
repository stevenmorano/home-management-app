# Supabase Auth Foundation

This document records the current Supabase authentication setup and assumptions for the Home Management OS MVP.

## Current Auth Scope

Implemented:

- Supabase SSR client helpers for server, browser, and middleware contexts.
- Middleware session refresh using Supabase auth cookies.
- Email/password sign in.
- Email/password sign up.
- Auth callback route for email confirmation links.
- Sign out server action.
- Protected dashboard route at `/dashboard`.
- Root route `/` redirects authenticated users to `/dashboard` and unauthenticated users to `/login`.
- Login route `/login` redirects authenticated users back to `/dashboard`.
- Supabase project connectivity has been verified.
- Test auth user creation succeeded with email confirmation disabled for local development.
- Test property creation through an authenticated Supabase session succeeded.

Not implemented yet:

- OAuth providers.
- Password reset.
- Household sharing or roles.
- Google Calendar OAuth.
- Upload storage.

## Environment Variables

Required for auth to work:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

These values should be copied from the Supabase project settings into `.env.local`.

The current local `.env.local` contains Supabase project values. The app intentionally displays a setup warning on `/login` when Supabase values are missing. Protected routes redirect back to `/login` with a configuration message.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public redirect | Sends users to `/dashboard` or `/login` based on session state. |
| `/login` | Public | Email/password sign in and sign up. |
| `/auth/callback` | Public | Exchanges Supabase email confirmation code for a session. |
| `/dashboard` | Authenticated | Protected starter property health dashboard. |

## Auth Helpers

- `src/lib/env.ts`: validates public Supabase environment values when present.
- `src/lib/auth.ts`: reads the current user and protects server routes.
- `src/lib/supabase/server.ts`: creates a per-request Supabase server client.
- `src/lib/supabase/client.ts`: creates a browser Supabase client for future client components.
- `src/lib/supabase/middleware.ts`: refreshes Supabase auth cookies.
- `src/app/auth/actions.ts`: server actions for sign in, sign up, and sign out.
- `src/app/auth/callback/route.ts`: email confirmation callback handler.

## Security Assumptions

- Email/password auth is acceptable for the family-and-friends pilot foundation.
- Supabase Auth owns user identity.
- User-owned data must be scoped by `auth.uid()` once tables exist.
- RLS must be enabled before any private homeowner data is stored.
- The anon key is safe to expose publicly only when RLS policies protect user data.
- Service role keys must never be exposed in the browser or committed to git.

## RLS Preparation

The first schema migration enables RLS for `profiles`, `properties`, `rooms`, and `asset_systems`.

Current migration:

```text
supabase/migrations/202606040001_initial_home_schema.sql
```

Policy shape:

```sql
alter table properties enable row level security;

create policy "Users can read their own properties"
on properties for select
using (user_id = auth.uid());

create policy "Users can create their own properties"
on properties for insert
with check (user_id = auth.uid());

create policy "Users can update their own properties"
on properties for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own properties"
on properties for delete
using (user_id = auth.uid());
```

Rooms and asset systems use ownership checks through the parent property. Apply the same pattern later to work records, reminders, contractors, and document metadata.

## Next Auth Work

- Add password reset once pilot account flows need it.
- Replace placeholder database types with generated Supabase types once the CLI workflow is set up.
