# Implementation Plan

This plan starts after stack selection.

## Current Status

Project scaffold and authentication foundation are complete for the first protected web prototype:

- Workspace verified at `D:\CodexWorkspaces\home-management-app`.
- Next.js, React, TypeScript, Tailwind, and shadcn/ui-style component foundation are in place.
- Supabase client packages and placeholder client/server helpers are installed.
- `.env.example` documents planned Supabase and Google Calendar variables.
- Protected dashboard shell reflects the Property Health Command Center direction.
- Supabase auth foundation is implemented with email/password forms, session refresh middleware, auth callback handling, and sign out.
- Initial Supabase schema migration is implemented for profiles, properties, rooms, and asset systems.
- RLS policies are included in the initial migration.
- Authenticated users with no property see a first-property setup form.
- Authenticated users with a property see that property on the dashboard.
- `.env.local` placeholder and Supabase schema verification script are in place.
- Supabase project URL/key are configured locally.
- Initial migration has been applied in Supabase.
- `npm run verify:supabase` passes against the real project.
- A test user and property were created successfully through the RLS-protected write path.
- `npm run lint` and `npm run build` pass.
- Local app verification confirms `/login` renders without the setup warning and unauthenticated `/dashboard` redirects to `/login`.

The next implementation milestone is the guided asset/system checklist and replacing static asset cards with Supabase-backed asset records.

## Build Order

1. Project scaffold. Complete.
2. Authentication. Foundation complete; password reset and provider-specific polish pending.
3. Database schema. Initial profiles/properties/rooms/asset systems migration complete.
4. Property creation and switching. First-property creation complete; multi-property switching pending.
5. Property type onboarding.
6. Guided asset/system checklist.
7. Asset/system CRUD.
8. Dashboard status calculation.
9. Home health dashboard UI.
10. Work records.
11. Contractors.
12. Reminders.
13. Google Calendar sync.
14. Optional document/photo uploads.
15. Export/backup consideration.
16. Pilot polish and testing.

## Early Technical Priorities

- Keep the selected stack fast to build and easy to deploy.
- Keep the data model relational and clean.
- Treat uploads and calendar OAuth carefully.
- Optimize first for the property dashboard and asset inventory workflow.
- Avoid billing, advanced AI, and complex admin tooling until the pilot proves value.

## Suggested First Prototype

The first clickable prototype should include:

- First property setup.
- Property type selection.
- Guided checklist.
- Asset cards with status.
- Dashboard with Good, Due Soon, Needs Attention, Missing Info.
- Add/edit asset flow.

This can be built before full Google Calendar or uploads to validate the product feel.

## Testing Focus

- User can complete onboarding without knowing every detail.
- Unknown details become Missing Info, not blockers.
- Dashboard status is understandable.
- Multi-property switching does not confuse the user.
- Asset records can be simple or detailed.
- Work history can be logged quickly.
