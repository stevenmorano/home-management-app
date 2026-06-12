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

- Protected HomeKeep Modern Care dashboard at `/dashboard`
- Email/password auth page at `/login`
- First-property setup form for authenticated users with no properties
- Mobile-first dashboard shell with Home, Systems, Add, and More sections
- Guided add flow for authenticated users with a property
- Reopenable Add item flow for properties that already have assets
- Compact multi-select Add picker with specific heating/cooling starter items and selected-item review for quantities and repeat/custom names
- Data-backed visual asset/system rows after assets are created
- Focused Service Passport asset detail editing for brand, model, serial number, install year, estimated age, condition, last service date, next due date, maintenance interval, expected lifespan, replacement cost, ownership responsibility, and notes
- Typed asset removal confirmation
- Property header with quiet multi-property switcher
- Add another property from More
- Edit active property details from More
- Home health score card and status counts: Good, Due Soon, Needs Attention, Missing Info
- Asset/system rows with structured status metadata and friendly missing-info prompts
- Quick Add actions for Add item, Note, Maintenance, and Photo. Only Add item is currently wired.
- Upcoming maintenance list derived from due-soon and needs-attention assets
- Authenticated mobile screenshot QA artifacts under `docs/qa/screenshots/`

Current verified Supabase state:

- `.env.local` contains the project URL and publishable anon key.
- The initial schema migration and duplicate-prevention migration have been applied in Supabase.
- `npm run verify:supabase` passes.
- A test auth user and first property were created successfully through the anon key and RLS.
- A test property asset inventory was created successfully through the anon key and RLS.
- A test asset detail update was created successfully through the anon key and RLS.
- Duplicate asset insertion is blocked by the database unique index.
- Multiple same-type assets are supported when each item has a distinct category/name pair, such as `appliance:Garage refrigerator` and `appliance:Kitchen refrigerator`.
- Authenticated mobile visual QA has been captured for Home, Add, Systems, and Asset Detail.
- The first mobile polish pass confirms no bottom-nav overlap and no horizontal overflow on the tested 390 x 844 mobile viewport.
- Add picker QA confirms no bottom-nav overlap and no horizontal overflow for the earlier default picker and selected Refrigerator naming panel.
- Compact Add picker QA confirms no bottom-nav overlap and no horizontal overflow with 17 selectable starter tiles in the primary grid.
- Asset Detail passport QA confirms no bottom-nav overlap and no horizontal overflow for the selected asset detail screen.

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

Latest verified handoff checks:

```text
2026-06-05: npm run lint passed
2026-06-05: npm run build passed
2026-06-05: npm run verify:supabase passed
2026-06-05: authenticated mobile screenshot QA passed for bottom-nav overlap and horizontal overflow
2026-06-05: Add picker screenshot QA passed for default picker and selected Refrigerator states
2026-06-05: Asset Detail passport screenshot QA passed for selected asset detail state
2026-06-05: Compact Add picker screenshot QA passed with 17 primary starter tiles
2026-06-11: npm run lint passed
2026-06-11: npm run build passed
2026-06-11: npm run verify:supabase passed
2026-06-11: selected-item Add review step implemented for quantities and custom names
2026-06-11: mobile screenshot QA attempted but blocked because new Supabase sign-ups require email confirmation and documented test accounts did not accept the available QA password convention
2026-06-11: URL-scoped multi-property switching implemented
2026-06-11: RLS-safe property detail editing implemented from More
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
- Re-adding an exact same starter name should not create another visible card.
- Add item reopens the compact multi-select guided add flow with Popular picks, expandable More home items, object tiles, and a selected-item review step for quantities and names.
- Adding the same starter type again with a specific name should create a separate asset row.
- `/dashboard` defaults to a short Home view after inventory exists.
- `/dashboard?tab=systems` shows the full inventory.
- `/dashboard?tab=systems&asset=<id>` shows the selected asset detail/edit view.
- `/dashboard?tab=add` shows the compact multi-select guided Add picker.
- `/dashboard?tab=more` shows property/account utility surfaces.
- `/dashboard?inventory=1` remains supported and opens the Add view.
- `/dashboard?property=<id>&tab=home` selects that owned property when it exists.
- Dashboard tab links preserve the active `property=<id>` selection.
- Users with multiple properties can switch from the header on larger screens and from More on mobile.
- More allows adding another property and redirects to the new property.
- More allows editing the active property's name, type, address, location, year built, square feet, and notes.
- Saving asset details updates status and keeps ownership scoped to the signed-in user.
- Removing an asset requires typing `REMOVE`.

Current test account created during verification:

```text
home-management-test-1780544589781@gmail.com
```

Current test property:

```text
Test Property 1780544589781
Testville, NY
```

Current asset starter-flow test account:

```text
home-management-assets-test-1780545480211@gmail.com
```

Current asset starter-flow test property:

```text
Asset Checklist Test 1780545480211
```

Current asset starter-flow test assets:

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
