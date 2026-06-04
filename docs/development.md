# Development Guide

This guide records the current local development setup for the Home Management OS web app.

## Workspace

The active project folder is:

```text
D:\CodexWorkspaces\home-management-app
```

## Current Scaffold

The web app is scaffolded with:

- TypeScript
- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui-style local components
- Supabase browser/server helper modules
- `zod` for environment validation
- lucide-react icons

Current starter app surface:

- Protected property health dashboard shell at `/dashboard`
- Email/password auth page at `/login`
- First-property setup form for authenticated users with no properties
- Property header and switcher placeholder
- Status summary groups: Good, Due Soon, Needs Attention, Missing Info
- Asset/system cards with structured status metadata
- Guided setup checklist placeholder
- Upcoming work/reminders placeholder

Current verified Supabase state:

- `.env.local` contains the project URL and publishable anon key.
- The initial migration has been applied in Supabase.
- `npm run verify:supabase` passes.
- A test auth user and first property were created successfully through the anon key and RLS.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

By default, the app runs at:

```text
http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env.local` when setting up a new machine.
The current local `.env.local` is ignored by git and contains Supabase project values.

Required public Supabase values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Without these values, `/login` renders a setup warning and protected routes redirect back to `/login`.

The initial schema migration lives at:

```text
supabase/migrations/202606040001_initial_home_schema.sql
```

Apply it to Supabase before creating real properties.

Planned Google Calendar OAuth values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`

Secrets must stay out of git.

## Verification

Run these checks before handing off meaningful app changes:

```bash
npm run lint
npm run build
```

For dev-server verification, confirm the local app returns HTTP 200 and renders the dashboard shell.

With no Supabase environment configured, verify:

- `/` redirects to `/login`.
- `/dashboard` redirects to `/login` with a setup message.
- `/login` renders the auth form and setup warning.

With Supabase configured and the migration applied, verify:

- `npm run verify:supabase` confirms the initial tables are reachable.
- A signed-in user with no property sees the first-property setup form.
- Creating a property redirects back to `/dashboard`.
- `/dashboard` shows the created property name and location metadata.

Current test account created during verification:

```text
home-management-test-1780544589781@gmail.com
```

Current test property:

```text
Test Property 1780544589781
Testville, NY
```

## Dependency Notes

The project currently uses Next.js 16, React 19, and Tailwind CSS 4 as resolved by npm.

`npm audit` currently reports moderate advisories from Next's nested PostCSS dependency. npm's suggested forced fix would install an older breaking Next version, so do not apply `npm audit fix --force` without a deliberate framework-version decision.
