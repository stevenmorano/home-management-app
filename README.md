# Home Management Operating System

A homeowner-focused web app for tracking major home systems, maintenance, work history, reminders, contractors, and records.

The product is currently shaped as **HomeKeep Modern Care**: a bright, visual home-care dashboard where users can see home health, upcoming maintenance, important systems, missing details, and quick add actions.

## Current Stage

This project has a protected Next.js web prototype with Supabase connected. Authentication, the initial RLS-backed schema, duplicate asset prevention, first-property setup, and asset/system CRUD flows have been verified against the Supabase project.

Current app surfaces:

- `/login`: email/password sign in and sign up.
- `/dashboard`: protected property dashboard.
- `/dashboard?tab=home`: mobile-first Home summary.
- `/dashboard?tab=systems`: full inventory and selected asset detail views.
- `/dashboard?tab=add`: compact multi-select Add picker.
- `/dashboard?tab=more`: property/account utility view.
- First-property setup for authenticated users with no properties.
- HomeKeep Modern Care dashboard with a home health score, upcoming maintenance, quick actions, and visual home-system rows.
- Guided add flow for starter systems/assets based on property type.
- Mobile-first dashboard sections for Home, Systems, Add, and More.
- Compact multi-select Add picker with specific heating/cooling items and a focused naming panel for repeat/custom items.
- Data-backed asset/system rows after checklist or custom creation.
- Reopenable Add item flow with repeatable starter cards and added-count labels.
- Focused asset detail editing for identity, age, maintenance, planning, responsibility, and notes.
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

Useful checks:

```bash
npm run lint
npm run build
npm run verify:supabase
```

## Core MVP Promise

- Add one or more properties.
- Select property type, such as house, condo, apartment, rental, or vacation home.
- Build a guided inventory of major systems/assets.
- Track install/replacement years, service dates, age ranges, condition, expected lifespan, replacement cost, brand/model/serial, ownership responsibility, and notes.
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
- [Roadmap](docs/roadmap.md)
- [Implementation Plan](docs/implementation-plan.md)
- [Development Guide](docs/development.md)
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
