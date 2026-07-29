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
- Guided add starter items are compact multi-select object tiles instead of disabled one-time checklist options.
- Inline asset detail editing is implemented for install year, estimated age, condition, last service date, and notes.
- Custom asset/system creation is implemented from the dashboard inventory panel.
- Inline asset detail editing now also supports maintenance interval value, maintenance interval unit, and next service due date.
- Inline asset detail editing now supports brand, model, serial number, expected lifespan, estimated replacement cost, and ownership responsibility.
- Asset removal is implemented with explicit typed confirmation.
- Dashboard status calculation now uses one deterministic domain module. Known condition or an explicit next service due date establishes health; other record details remain Missing Info for health purposes.
- Home health now scores only assessable systems, shows assessed-system coverage separately, and displays no numeric score when health evidence is unavailable.
- The earlier Quiet Ledger dashboard direction was replaced after visual review because it felt too old-school and muted.
- The first HomeKeep Modern Care UI pass is implemented: bright modern app palette, HomeKeep-style header, home health score card, upcoming maintenance list, quick actions, visual home-system rows, asset detail editing, and typed delete confirmation.
- Checklist appliance suggestions now create individual appliance records instead of one generic Major appliances record.
- The guided add flow supports multiple same-type items by editing the default name, such as changing Refrigerator to Garage refrigerator or Kitchen refrigerator.
- The Add tab is compressed for phones with a compact multi-select Popular picks grid, remaining suggestions behind More home items, and a compact custom-add form.
- The Add tab now uses specific starter items instead of vague HVAC buckets, including Central AC, Heat pump, Mini-split, Furnace, Fireplace, Thermostat, and Water heater.
- The Add tab still supports focused naming for repeat/custom items, such as changing Refrigerator to Basement fridge or Kitchen fridge.
- The dashboard now uses mobile-first app sections: Home, Systems, Add, and More.
- Phone screens use bottom navigation; larger screens use a segmented section nav.
- Home is a shorter summary screen with a compact systems preview, while Systems holds the full editable inventory list.
- Systems rows now open a focused asset detail/edit view instead of embedding expanded editors in every row.
- Asset detail now uses a premium Service Passport layout with a stronger hero, status badge, service metric cards, status explanation, notes, record profile, and compact edit area.
- Asset detail updates are ownership-checked through the parent property.
- Custom asset creation, asset detail updates, and asset removal are ownership-checked through the parent property.
- Asset detail update flow has been verified against Supabase with a temporary test user/property/asset.
- `npm run lint` and `npm run build` pass.
- `npm run verify:supabase` passes against the configured Supabase project.
- Local app verification confirms `/login` renders without the setup warning and unauthenticated `/dashboard` redirects to `/login`.
- Authenticated mobile visual QA is complete for Home, Add, Systems, and Asset Detail. Findings are recorded in `docs/qa/mobile-visual-qa.md`.
- Mobile QA polish is implemented for bottom navigation overlap, Home Health compaction, Systems row compaction, and Asset Detail header wrapping.
- Follow-up authenticated mobile visual QA confirms no bottom-nav overlap and no horizontal overflow for Home, Add, Systems, and Asset Detail.
- Add picker visual QA confirms no bottom-nav overlap and no horizontal overflow for the compact multi-select picker, default picker, and selected Refrigerator naming panel.
- Asset detail passport visual QA confirms no bottom-nav overlap and no horizontal overflow for the selected asset detail screen.
- RLS-backed work records are implemented with full CRUD, optional asset/location links, performer/provider context, cost, and notes.
- Home shows recently completed work, and Service Passports show linked service history.
- Linked work records advance asset last-service dates forward without changing next-due dates.
- Authenticated maintenance coverage verifies UI CRUD, cross-property rejection, service-date synchronization, mobile overflow, and cleanup.

The selected-item review wizard is implemented. The first rooms/locations slice is implemented: users can manage lightweight locations from More, assign an asset/system to a location from asset detail, and see assigned location context on Systems rows and asset detail. A later polish pass can add stronger location grouping and starter-name-to-location suggestions.

## Build Order

1. Project scaffold. Complete.
2. Authentication. Foundation complete; password reset and provider-specific polish pending.
3. Database schema. Initial profiles/properties/rooms/asset systems migration complete.
4. Property creation and switching. First-property creation, adding another property from More, URL-scoped multi-property switching, and active-property detail editing are complete.
5. Property type onboarding.
6. Guided asset/system starter flow. Complete for initial creation and repeatable named additions.
7. Asset/system CRUD. Create from starter cards, custom asset creation, focused detail editing, room/location assignment, and removal are complete; detail UX polish is in progress.
8. Rooms/locations. First pass complete for CRUD, asset assignment, and display context.
9. Dashboard status calculation. Shared deterministic status, explanation, health scoring, date-boundary tests, and assessed-system coverage are complete; the stored database status remains a compatibility snapshot.
10. Home health dashboard UI. HomeKeep Modern Care, HomeCare Glass, mobile-first tab shell, compact multi-select Add picker, selected-item review wizard, focused Service Passport asset detail, authenticated mobile screenshot QA, and first mobile QA polish are complete.
11. Work records. Complete for the Care Ledger foundation and linked Service Passport history.
12. Contractors.
13. Reminders.
14. Google Calendar sync.
15. Optional document/photo uploads.
16. Export/backup consideration.
17. Pilot polish and testing.

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
