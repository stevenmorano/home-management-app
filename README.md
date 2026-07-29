# Home Management Operating System

A homeowner-focused web app for tracking major home systems, maintenance, work history, reminders, contractors, and records.

The product is currently shaped as **HomeKeep Modern Care**: a bright, visual home-care dashboard where users can see home health, upcoming maintenance, important systems, missing details, and quick add actions.

## Current Stage

This project has a protected Next.js web prototype with Supabase connected. Authentication, the RLS-backed property and work-history schemas, duplicate asset prevention, first-property setup, asset/system CRUD, and completed-maintenance CRUD have been verified against the Supabase project.

Current app surfaces:

- `/login`: email/password sign in and sign up.
- `/dashboard`: protected property dashboard.
- `/dashboard?tab=home`: mobile-first Home summary.
- `/dashboard?tab=systems`: full inventory and selected asset detail views.
- `/dashboard?tab=add`: compact multi-select Add picker with selected-item review.
- `/dashboard?tab=maintenance`: completed-work entry, editing, deletion, and recent history.
- `/dashboard?tab=more`: property/account utility view with property switching, editing, add-property support, and room/location management.
- First-property setup for authenticated users with no properties.
- HomeKeep Modern Care dashboard with a home health score, upcoming maintenance, quick actions, and visual home-system rows.
- Guided add flow for starter systems/assets based on property type.
- Mobile-first dashboard sections for Home, Systems, Add, and More.
- Compact multi-select Add picker with specific heating/cooling items and a selected-item review step for quantities and repeat/custom names.
- URL-scoped multi-property switching with active property editing from More.
- Rooms/locations for organizing assets by Kitchen, Basement, Garage, Exterior, Laundry, Bedroom, or custom places.
- Data-backed asset/system rows after checklist or custom creation.
- Reopenable Add item flow with repeatable starter tiles, selected-item quantities, custom names, and added-count labels.
- Focused asset detail editing for identity, age, maintenance, planning, responsibility, and notes.
- Care Ledger work history with property, asset, room, performer, provider, date, cost, description, and notes.
- Recently completed work on Home and linked service history in each Service Passport.
- Typed asset removal confirmation.
- Authenticated mobile visual QA evidence for Home, Add, Systems, and Asset Detail in `docs/qa/mobile-visual-qa.md`.

The first target is a family-and-friends pilot for homeowners who currently track little or nothing about their home maintenance.

## Stack

- TypeScript
- Next.js and React
- Tailwind CSS and shadcn/ui-style components
- Supabase for Postgres, Auth, Storage, and row-level security
- Google Calendar API through server-side routes/functions
- Future Expo React Native app for iOS

## Getting Started

Install dependencies and run the web app:

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in Supabase values. Supabase values are required for the current auth, first-property, and asset flows. Google OAuth values are planned for later calendar work.

Authenticated Playwright coverage additionally uses one permanent, confirmed Supabase
automation account through `E2E_USER_EMAIL` and `E2E_USER_PASSWORD`. If those optional
local values are absent, `npm run test:e2e` runs public coverage only.

Useful checks:

```bash
npm run test
npm run lint
npx tsc --noEmit --incremental false
npm run test:e2e
npm run audit:production
npm run verify:supabase
```

## Core MVP Promise

- Add one or more properties.
- Select property type, such as house, condo, apartment, rental, or vacation home.
- Build a guided inventory of major systems/assets.
- Track install/replacement years, service dates, age ranges, condition, expected lifespan, replacement cost, brand/model/serial, ownership responsibility, and notes.
- Organize assets by room/location.
- Add multiple same-type items with specific names, such as Garage refrigerator, Butler pantry dishwasher, Upstairs AC, Basement furnace, or Back deck.
- See a visual dashboard with Good, Due Soon, Needs Attention, and Missing Info.
- Get in-app reminders and sync selected maintenance events to Google Calendar.
- Optionally upload documents, receipts, warranties, manuals, and photos.

## Documentation

- [Product Design](docs/product-design.md)
- [Documentation Index](docs/README.md)
- [UI Design Direction](docs/ui-design-direction.md)
- [Product Requirements](docs/product-requirements.md)
- [UX Flows](docs/ux-flows.md)
- [Mobile Visual QA](docs/qa/mobile-visual-qa.md)
- [Data Model](docs/data-model.md)
- [Initial Database Schema](docs/database-schema.md)
- [Tech Stack Decision](docs/tech-stack.md)
- [Architecture Plan](docs/architecture.md)
- [Security And Privacy](docs/security-privacy.md)
- [Security Hardening Design](docs/security-hardening-design.md)
- [Asset Health Design](docs/asset-health-design.md)
- [Roadmap](docs/roadmap.md)
- [Implementation Plan](docs/implementation-plan.md)
- [Development Guide](docs/development.md)
- [CI And Authenticated Browser Testing](docs/ci-authenticated-testing-design.md)
- [Work History Design](docs/work-history-design.md)
- [July 2026 Review Checkpoint](docs/checkpoint-2026-07-28.md)
- [Supabase Auth Foundation](docs/supabase-auth.md)
- [Supabase Setup And Verification](docs/supabase-setup.md)
- [Decision Records](docs/adr/README.md)

## Non-Goals For MVP

- AI invoice parsing
- AI home analysis
- Contractor marketplace
- Paid subscriptions or paywalls
- Native mobile app
- Child chore rewards
- Guest or contractor access
- Complex project management
- Advanced resale or insurance reports
