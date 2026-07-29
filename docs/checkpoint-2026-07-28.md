# July 2026 Review And Work History Checkpoint

Status: Ready for pull request
Date: 2026-07-28

## Scope

This checkpoint consolidates the first full project review since the earlier mobile
prototype work.

### Security And Dependencies

- Upgraded Next.js, React, React DOM, and matching lint configuration.
- Pinned patched PostCSS and Sharp transitive versions.
- Replaced the deprecated Next.js middleware entry with `proxy.ts`.
- Contained authentication callback redirects to safe same-origin paths.
- Added unit and browser security coverage.
- Production dependency audit reports zero vulnerabilities.

### Asset Health

- Centralized assessability, status, explanation, score, and coverage rules in one
  deterministic domain module.
- Separated Missing Info coverage from numeric health scoring.
- Added date-boundary and scoring tests.

### CI And Browser Testing

- Added Vitest and Playwright.
- Added GitHub Actions quality and browser jobs.
- Added one permanent Supabase automation account with RLS-scoped fixtures.
- Prevented future test runs from creating throwaway authentication users.
- Added public auth/security, responsive health, and Care Ledger browser scenarios.

### Work History

- Added the RLS-protected `work_records` schema and applied it to the pilot Supabase
  project.
- Added Care Ledger create, view, edit, and typed deletion.
- Added optional property asset and room links, performer/provider context, cost,
  descriptions, and notes.
- Added Recently Completed on Home and linked history in Service Passports.
- Added forward-only asset service-date synchronization.
- Added cross-property integrity validation.

## Verification

- 47 unit tests passed.
- 8 Playwright tests passed.
- ESLint passed.
- TypeScript passed.
- Production build passed.
- Production dependency audit found zero vulnerabilities.
- Live Supabase verification passed for `profiles`, `properties`, `rooms`,
  `asset_systems`, and `work_records`.
- Authenticated test fixtures cleaned up through normal RLS.

## Known Gaps

- Password reset and optional OAuth provider polish are not implemented.
- Contractor profiles are not reusable yet; work records store a provider-name
  snapshot.
- Reminders and Google Calendar synchronization are not implemented.
- Document and photo storage is not implemented.
- A full development dependency audit still reports ESLint-toolchain metadata
  advisories for which npm proposes an unsafe breaking downgrade; production
  dependencies are clean.

## Recommended Next Slice

Build the reusable Contractor Directory and link contractor records to future work
entries while preserving the provider-name snapshot on existing history.
