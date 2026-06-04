# Home Management Operating System

A homeowner-focused web app for tracking major home systems, maintenance, work history, reminders, contractors, and records.

The product is designed as a **Property Health Command Center**: users can open the app and quickly see what in their home is good, what needs attention soon, what information is missing, and what may become costly.

## Current Stage

This project has a protected Next.js web prototype with Supabase connected.
Authentication, the initial RLS-backed schema, and the first-property flow have been verified against the Supabase project.

Current app surfaces:

- `/login`: email/password sign in and sign up.
- `/dashboard`: protected property dashboard.
- First-property setup for authenticated users with no properties.
- Data-backed dashboard property header after a property is created.
- Guided asset/system checklist for properties with no assets.
- Data-backed asset/system dashboard cards after checklist creation.
- Reopenable “Add more systems” checklist with already-added items disabled.
- Inline asset detail editing for age, condition, service date, and notes.

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

Copy `.env.example` to `.env.local` and fill in Supabase and Google OAuth values when those services are created.
Supabase values are required for the current auth and first-property flow.

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
- Track install/replacement years, service dates, age ranges, condition, costs, contractors, and work history.
- See a visual dashboard with Good, Due Soon, Needs Attention, and Missing Info.
- Get in-app reminders and sync selected maintenance events to Google Calendar.
- Optionally upload documents, receipts, warranties, manuals, and photos.

## Documentation

- [Product Design](docs/product-design.md)
- [Documentation Index](docs/README.md)
- [Product Requirements](docs/product-requirements.md)
- [UX Flows](docs/ux-flows.md)
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
