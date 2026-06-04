# Supabase Setup And Verification

Use this guide to connect the local app to a Supabase project and verify the current auth plus first-property flow.

## Current Project Status

The local project is currently connected to Supabase:

- `.env.local` contains the Supabase project URL and publishable anon key.
- The initial schema migration and duplicate-prevention migration have been applied.
- `npm run verify:supabase` passes.
- A test user and test property were created successfully through the authenticated/RLS write path.
- Test asset creation, duplicate prevention, and asset detail updates have been verified through authenticated/RLS write paths.

## 1. Create `.env.local`

`.env.local` is ignored by git and should hold project-specific values.

For a new machine or clone, create it from `.env.example`:

```text
.env.local
```

Fill in:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Find these in Supabase under Project Settings -> API.

Do not add service-role keys to the frontend app.

## 2. Apply Initial Migration

Apply migration SQL files to the Supabase project in order:

```text
supabase/migrations/202606040001_initial_home_schema.sql
supabase/migrations/202606040002_dedupe_asset_systems.sql
```

Current options:

- Supabase SQL Editor: paste the migration SQL and run it.
- Supabase CLI: link the project and push migrations once the CLI is installed and authenticated.

The CLI is not currently installed in this local environment, so SQL Editor is the immediate path for now.

## 3. Check Schema Reachability

After `.env.local` is filled and the migration is applied, run:

```bash
npm run verify:supabase
```

This checks:

- Supabase URL/key are present.
- `profiles` table is queryable.
- `properties` table is queryable.
- `rooms` table is queryable.
- `asset_systems` table is queryable.

Because RLS is enabled, this script only verifies schema reachability with the anon key. It does not bypass user privacy.

## 4. Verify Auth, First Property, And Inventory

Run the app:

```bash
npm run dev
```

Then verify:

1. Open `http://localhost:3000/login`.
2. Create an account or sign in.
3. Confirm the app redirects to `/dashboard`.
4. Confirm a signed-in user with no properties sees the first-property setup form.
5. Create a property.
6. Confirm the dashboard shows that property in the header.
7. Add checklist assets.
8. Confirm Add more systems reopens the checklist and existing items are marked Already added.
9. Save basic asset details.
10. Sign out.
11. Confirm `/dashboard` redirects back to `/login`.

Current verified test account:

```text
home-management-test-1780544589781@gmail.com
```

Current verified test property:

```text
Test Property 1780544589781
Testville, NY
```

Current verified asset edit test:

```text
home-management-edit-test-1780545793132@gmail.com
Edit Flow Test 1780545793132
```

## Troubleshooting

If `/dashboard` shows a schema error, apply the migration or confirm it ran successfully.

If sign-up requires email confirmation, follow the Supabase confirmation email or adjust the Supabase Auth email confirmation setting for local pilot testing.

If `npm run verify:supabase` fails with a table error, the migration is not applied to the project behind the current `.env.local` values.
