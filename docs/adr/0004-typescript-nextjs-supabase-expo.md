# ADR 0004: TypeScript, Next.js, Supabase, And Expo

## Status

Accepted

## Context

The product starts as a web app but should eventually support iOS. It needs authentication, relational home data, private file uploads, Google Calendar sync, dashboard UI, and a path to a family/friends pilot without heavy operational complexity.

## Decision

Use a TypeScript-first stack:

- Next.js and React for the web app.
- Supabase for PostgreSQL, Auth, Storage, row-level security, and optional Edge Functions.
- Google Calendar API through server-side routes/functions.
- Expo React Native with TypeScript for future iOS.

## Alternatives Considered

- Native Swift iOS app first.
- Python backend with separate frontend.
- Custom Node/Express backend from day one.
- Flutter for future mobile.

## Rationale

This keeps the language surface small, supports fast web delivery, provides managed backend services that match the product needs, and leaves a clean future path to iOS without rebuilding the backend.

## Consequences

- TypeScript becomes the primary language for web, backend-adjacent logic, and future mobile.
- Supabase row-level security and private storage must be designed carefully.
- Calendar sync and OAuth should stay server-side.
- Native iOS-specific features may require Swift modules later, but not during the MVP.

