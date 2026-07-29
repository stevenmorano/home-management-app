# CI And Authenticated Browser Testing Design

Status: Implemented and verified locally
Date: 2026-07-26

## Understanding Summary

- Use the existing Supabase project as the development/pilot environment for now.
- Preserve the owner's personal account and all existing data.
- Create one permanent, confirmed automation account manually in Supabase.
- Stop creating a new authentication user for every test run.
- Create uniquely named properties and assets owned only by the automation account.
- Delete only fixture data owned by the automation account.
- Add GitHub Actions enforcement for code quality, build, public browser coverage, and authenticated health-state coverage.

## Assumptions And Non-Functional Requirements

- CI runs on pushes and pull requests targeting `main`.
- GitHub-hosted Ubuntu and Node.js 22 provide the CI runtime.
- GitHub repository secrets provide the Supabase URL, publishable key, automation email, and automation password.
- No service-role key is required or stored.
- Missing CI secrets fail with a concise setup message rather than silently omitting authenticated coverage.
- Local Playwright runs may execute public tests only when automation credentials are absent.
- Browser tests use one worker and small datasets, targeting a total workflow time below roughly 15 minutes.
- Supabase unavailability fails authenticated CI because the hosted integration is part of the tested system.
- Existing throwaway authentication users are outside this slice and will not be deleted.
- Repository permissions remain read-only, and the workflow does not deploy, commit, or push.

## Approaches Considered

### 1. Shared login state with an RLS-scoped fixture client

Authenticate through the application once, reuse ignored browser storage state, and seed data through a Supabase client signed in as the same automation user.

Selected because it exercises real authentication and RLS without handling an administrator secret.

### 2. Fully UI-driven fixtures

Create and edit all fixture data through browser forms.

Rejected because it is slower and more fragile, and the current application lacks a complete property-deletion flow for reliable cleanup.

### 3. Service-role fixture setup

Seed and delete fixtures through a Supabase administrator client.

Rejected because the service-role secret is unnecessarily powerful for this test scope.

## Final Architecture

### Playwright Projects

- `public-chromium` runs unauthenticated security and responsive coverage.
- `auth-setup` signs in through the HomeKeep login form and writes browser state under ignored `playwright/.auth/`.
- `authenticated-chromium` depends on `auth-setup`, reuses its state, and runs authenticated dashboard scenarios.

Local `.env.local` supplies optional automation credentials. Without those credentials, the normal local E2E command runs public coverage only. CI performs an explicit environment preflight before running the complete suite.

### Fixture Client

The fixture helper signs in with `signInWithPassword` using the project publishable key and permanent automation account. All reads and writes remain subject to normal RLS.

Before authenticated coverage, the helper removes stale automation-owned properties whose names start with the reserved `HomeKeep E2E —` prefix. Each test then:

1. Creates a uniquely named property.
2. Inserts only the asset records required by the scenario.
3. Records the exact property UUID.
4. Opens the dashboard using that property selection.
5. Deletes the exact property UUID during teardown.

The existing foreign-key cascade removes child asset rows.

### GitHub Actions

`.github/workflows/ci.yml` contains:

- A `quality` job for `npm ci`, unit tests, ESLint, TypeScript, production audit, and production build.
- A `browser` job for secret preflight, Chromium installation, build, public Playwright coverage, authenticated Playwright coverage, and failure-artifact upload.
- Read-only repository permissions.
- Concurrency cancellation for stale runs.

Required repository secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

## Authenticated Browser Scenarios

### Insufficient Health Data

- Create a property with two unknown systems.
- Verify the score is unavailable.
- Verify `0 of 2` systems are assessed.
- Verify two Missing Info records.
- Exercise the mobile viewport.

### Mixed Health Data

- Create Good, Fair, Poor, and Unknown systems.
- Verify score `68`.
- Verify `3 of 4` systems are assessed.
- Verify status counts and Needs Attention message priority.
- Exercise the desktop viewport.

Both scenarios reject page errors, console errors, and horizontal overflow.

## Failure Handling And Security

- Tests never create or delete authentication users.
- Secrets and passwords are never printed.
- Browser authentication state is ignored and recreated for each run.
- Fixture cleanup failures fail the test.
- CI uses one browser worker and one retry for transient hosted-service failures.
- Failed traces and reports are uploaded; successful runs retain no unnecessary artifacts.
- An abruptly terminated run may leave prefixed fixture data, which the next authenticated run removes through the automation account's RLS scope.

## Setup

1. Create one confirmed automation user in Supabase Authentication → Users.
2. Use a strong password that is not shared with any personal account.
3. Add `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` to local `.env.local`.
4. Add the four required repository secrets in GitHub before enabling authenticated CI.

Before real users are invited, move automated testing to a separate Supabase project.

Local verification completed on 2026-07-26: the production build passed, four public
browser tests passed, UI authentication succeeded, both authenticated health-state
scenarios passed, and fixture teardown completed without error.

## Completion Gates

- Unit tests pass.
- ESLint passes.
- TypeScript passes.
- Production dependency audit passes.
- Production build passes.
- Public Playwright coverage passes without automation credentials.
- Authenticated Playwright coverage passes after the automation account is configured.
- Successful runs leave no fixture properties.
- Live Supabase verification passes.
- Git diff validation passes.
- No credentials, authentication state, reports, or fixture data are committed.

## Decision Log

| Decision | Alternatives | Rationale |
|---|---|---|
| Reuse the development/pilot project | Create a second project immediately | The owner is the only real user and the project already contains QA data. |
| Use one stable automation account | Create a user per run | Stops authentication-user buildup and simplifies credential management. |
| Seed through a signed-in client and RLS | Service-role client | Preserves production authorization boundaries without an administrator secret. |
| Authenticate through the UI once | Log in separately in every test | Reuses Playwright's supported storage-state pattern and reduces runtime. |
| Use unique properties and exact-ID cleanup | Share a permanent fixture property | Prevents tests from coupling through mutable state. |
| Run authenticated tests serially | Parallelize one shared account | Avoids server-state collisions during the pilot. |
| Require CI secrets explicitly | Silently skip authenticated CI | Makes missing coverage visible and actionable. |
| Preserve existing throwaway users | Delete them in this slice | User deletion is destructive and requires a separate explicit cleanup decision. |
