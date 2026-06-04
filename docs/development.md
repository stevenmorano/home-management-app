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
- Guided asset/system checklist for authenticated users with a property but no assets
- Reopenable Add more systems checklist for properties that already have assets
- Data-backed asset/system cards after assets are created
- Inline asset detail editing for install year, estimated age, condition, last service date, and notes
- Property header and switcher placeholder
- Status summary groups: Good, Due Soon, Needs Attention, Missing Info
- Asset/system cards with structured status metadata
- Guided setup checklist placeholder
- Upcoming work/reminders placeholder

Current verified Supabase state:

- `.env.local` contains the project URL and publishable anon key.
- The initial schema migration and duplicate-prevention migration have been applied in Supabase.
- `npm run verify:supabase` passes.
- A test auth user and first property were created successfully through the anon key and RLS.
- A test property asset inventory was created successfully through the anon key and RLS.
- A test asset detail update was created successfully through the anon key and RLS.
- Duplicate asset insertion is blocked by the database unique index.

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

Follow-up migrations should also be applied in order:

```text
supabase/migrations/202606040002_dedupe_asset_systems.sql
```

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
- Re-selecting an existing checklist asset should not create another visible card.
- Add more systems reopens the checklist and marks existing items as Already added.
- Saving asset details updates status and keeps ownership scoped to the signed-in user.

Current test account created during verification:

```text
home-management-test-1780544589781@gmail.com
```

Current test property:

```text
Test Property 1780544589781
Testville, NY
```

Current asset checklist test account:

```text
home-management-assets-test-1780545480211@gmail.com
```

Current asset checklist test property:

```text
Asset Checklist Test 1780545480211
```

Current asset checklist test assets:

```text
HVAC
Roof
Water heater
```

Current asset edit test:

```text
home-management-edit-test-1780545793132@gmail.com
Edit Flow Test 1780545793132
HVAC updated with install year 2020, condition good, and last service date 2026-06-04
```

## Dependency Notes

The project currently uses Next.js 16, React 19, and Tailwind CSS 4 as resolved by npm.

`npm audit` currently reports moderate advisories from Next's nested PostCSS dependency. npm's suggested forced fix would install an older breaking Next version, so do not apply `npm audit fix --force` without a deliberate framework-version decision.
