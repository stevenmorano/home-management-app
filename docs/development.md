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

- Static property health dashboard shell
- Property header and switcher placeholder
- Status summary groups: Good, Due Soon, Needs Attention, Missing Info
- Asset/system cards with structured status metadata
- Guided setup checklist placeholder
- Upcoming work/reminders placeholder

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

Copy `.env.example` to `.env.local` when Supabase and Google OAuth services are created.

Required public Supabase values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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

## Dependency Notes

The project currently uses Next.js 16, React 19, and Tailwind CSS 4 as resolved by npm.

`npm audit` currently reports moderate advisories from Next's nested PostCSS dependency. npm's suggested forced fix would install an older breaking Next version, so do not apply `npm audit fix --force` without a deliberate framework-version decision.
