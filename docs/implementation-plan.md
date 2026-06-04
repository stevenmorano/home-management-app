# Implementation Plan

This plan starts after stack selection.

## Current Status

Project scaffold is complete for the first static web prototype:

- Workspace verified at `D:\CodexWorkspaces\home-management-app`.
- Next.js, React, TypeScript, Tailwind, and shadcn/ui-style component foundation are in place.
- Supabase client packages and placeholder client/server helpers are installed.
- `.env.example` documents planned Supabase and Google Calendar variables.
- Static dashboard shell reflects the Property Health Command Center direction.
- `npm run lint` and `npm run build` pass.
- Local dev server verification returned HTTP 200 for the dashboard shell.

The next implementation milestone is authentication and Supabase project/schema setup.

## Build Order

1. Project scaffold. Complete.
2. Authentication.
3. Database schema.
4. Property creation and switching.
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
