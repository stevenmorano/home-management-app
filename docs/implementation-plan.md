# Implementation Plan

This plan starts after stack selection.

## Current Status

Project scaffold and authentication foundation are complete for the first protected web prototype:

- Workspace verified at `D:\CodexWorkspaces\home-management-app`.
- Next.js, React, TypeScript, Tailwind, and shadcn/ui-style component foundation are in place.
- Supabase client packages and placeholder client/server helpers are installed.
- `.env.example` documents planned Supabase and Google Calendar variables.
- Protected dashboard shell now reflects the HomeKeep Modern Care direction.
- Supabase auth foundation is implemented with email/password forms, session refresh middleware, auth callback handling, and sign out.
- Initial Supabase schema migration is implemented for profiles, properties, rooms, and asset systems.
- RLS policies are included in the initial migration.
- Authenticated users with no property see a first-property setup form.
- Authenticated users with a property see that property on the dashboard.
- `.env.local` placeholder and Supabase schema verification script are in place.
- Supabase project URL/key are configured locally.
- Initial migration has been applied in Supabase.
- Duplicate-prevention migration has been applied in Supabase.
- `npm run verify:supabase` passes against the real project.
- A test user and property were created successfully through the RLS-protected write path.
- Guided asset/system starter flow is implemented for properties with no assets.
- Starter cards create RLS-protected `asset_systems` rows with Missing Info defaults.
- Dashboard asset cards now read from Supabase `asset_systems`.
- A test user/property/assets write path was created successfully through RLS.
- Duplicate starter submissions are guarded in app code, collapsed in the dashboard, and covered by the applied database uniqueness migration.
- The database unique index has been verified by attempting a duplicate insert and receiving constraint error `23505`.
- Add item reopens the guided add flow after assets exist.
- Guided add starter items are repeatable, editable-name cards instead of disabled one-time checklist options.
- Inline asset detail editing is implemented for install year, estimated age, condition, last service date, and notes.
- Custom asset/system creation is implemented from the dashboard inventory panel.
- Inline asset detail editing now also supports maintenance interval value, maintenance interval unit, and next service due date.
- Inline asset detail editing now supports brand, model, serial number, expected lifespan, estimated replacement cost, and ownership responsibility.
- Asset removal is implemented with explicit typed confirmation.
- Dashboard status calculation now considers useful details, condition, next service due date, and due-soon timing while keeping empty records as Missing Info.
- The earlier Quiet Ledger dashboard direction was replaced after visual review because it felt too old-school and muted.
- The first HomeKeep Modern Care UI pass is implemented: bright modern app palette, HomeKeep-style header, home health score card, upcoming maintenance list, quick actions, visual home-system rows, asset detail editing, and typed delete confirmation.
- Checklist appliance suggestions now create individual appliance records instead of one generic Major appliances record.
- The guided add flow supports multiple same-type items by editing the default name, such as changing Refrigerator to Garage refrigerator or Kitchen refrigerator.
- The Add tab is compressed for phones with Popular picks first, remaining suggestions behind More home items, and a compact custom-add form.
- The dashboard now uses mobile-first app sections: Home, Systems, Add, and More.
- Phone screens use bottom navigation; larger screens use a segmented section nav.
- Home is a shorter summary screen with a compact systems preview, while Systems holds the full editable inventory list.
- Systems rows now open a focused asset detail/edit view instead of embedding expanded editors in every row.
- Asset detail updates are ownership-checked through the parent property.
- Custom asset creation, asset detail updates, and asset removal are ownership-checked through the parent property.
- Asset detail update flow has been verified against Supabase with a temporary test user/property/asset.
- `npm run lint` and `npm run build` pass.
- `npm run verify:supabase` passes against the configured Supabase project.
- Local app verification confirms `/login` renders without the setup warning and unauthenticated `/dashboard` redirects to `/login`.
- Authenticated mobile visual QA is complete for Home, Add, Systems, and Asset Detail. Findings are recorded in `docs/qa/mobile-visual-qa.md`.
- Mobile QA polish is implemented for bottom navigation overlap, Home Health compaction, Systems row compaction, and Asset Detail header wrapping.
- Follow-up authenticated mobile visual QA confirms no bottom-nav overlap and no horizontal overflow for Home, Add, Systems, and Asset Detail.

The next implementation milestone is a deeper mobile Add flow redesign: tap a household object first, then edit the suggested name in a smaller focused surface instead of showing many mini-forms at once.

## Build Order

1. Project scaffold. Complete.
2. Authentication. Foundation complete; password reset and provider-specific polish pending.
3. Database schema. Initial profiles/properties/rooms/asset systems migration complete.
4. Property creation and switching. First-property creation complete; multi-property switching pending.
5. Property type onboarding.
6. Guided asset/system starter flow. Complete for initial creation and repeatable named additions.
7. Asset/system CRUD. Create from starter cards, custom asset creation, focused detail editing, and removal are complete; detail UX polish is in progress.
8. Dashboard status calculation. Data-backed status counts now consider condition and due dates; status explanation/polish pending.
9. Home health dashboard UI. HomeKeep Modern Care, HomeCare Glass, mobile-first tab shell, focused asset detail, Add compression, authenticated mobile screenshot QA, and first mobile QA polish are complete; deeper Add flow polish is pending.
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
- Guided starter inventory flow.
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
