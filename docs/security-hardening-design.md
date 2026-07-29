# Security Hardening Design

Status: Accepted
Date: 2026-07-26

## Understanding Summary

- The current HomeKeep prototype needs a security and regression-testing pass before more product work.
- The first implementation slice will close the confirmed auth callback open redirect.
- The app will move from the deprecated Next.js `middleware.ts` convention to `proxy.ts`.
- Vulnerable framework packages will receive targeted patch upgrades without a broad dependency refresh.
- Automated tests will cover redirect validation, protected-route behavior, responsive login rendering, and runtime errors.
- Existing uncommitted dashboard, room/location, type, and documentation changes must remain intact.
- Deployment, production database mutation, Git staging, commits, and pushes are outside this slice.

## Assumptions And Non-Functional Requirements

- The near-term audience is a small family-and-friends pilot.
- Security and predictable behavior take priority over feature expansion.
- The existing Supabase project and RLS model remain the authentication and data boundary.
- Patch upgrades must preserve the current Next.js 16, React 19, and Supabase architecture.
- The app must remain usable at the existing desktop and 390-by-844 mobile QA viewports.
- Every code change must pass focused tests, lint, TypeScript, production build, and high-severity dependency audit checks.
- The implementation should stay maintainable by extracting redirect policy into a small pure module.

## Approaches Considered

### 1. Targeted hardening with Vitest and Playwright

Upgrade the vulnerable framework patch line, extract and test redirect policy, migrate the request boundary, and add focused browser checks.

This approach was selected because it fixes the known risks while establishing reusable regression coverage.

### 2. Minimal patch with Node's built-in test runner

This would add fewer dependencies, but TypeScript and Next.js module handling would be more brittle and less conventional for the planned test suite.

### 3. Broad dependency refresh

This would update Next.js, Supabase, TypeScript, ESLint, and UI packages together. It was rejected for this slice because the larger regression surface is not justified by the immediate security goal.

## Final Design

### Redirect Policy

Add a pure helper that receives an untrusted redirect value and a trusted request origin. It must:

- Accept only absolute application paths beginning with `/`.
- Reject scheme-relative paths beginning with `//`.
- Reject absolute external URLs.
- Reject backslash-normalized host escapes and malformed URL values.
- Confirm that URL normalization preserves the trusted origin.
- Return a known application fallback when validation fails.

### Auth Callback

The callback route will:

- Read the authorization code and requested next path.
- Exchange the code for a Supabase session.
- Redirect through the safe redirect helper only after a successful exchange.
- Return to `/login` with a generic user-safe message when the code is missing or the exchange fails.
- Avoid exposing provider or database details in the redirect message.

### Next.js Request Boundary

Rename the root `middleware.ts` file to `proxy.ts` and rename its exported function to `proxy`. Preserve the current Supabase session-refresh matcher and cookie behavior.

### Dependency Scope

- Upgrade Next.js and its paired lint configuration to a patched Next.js 16 release.
- Upgrade React and React DOM only within their compatible React 19 patch line.
- Apply compatible transitive security fixes.
- Add Vitest and Playwright as development test tooling.
- Defer Supabase, TypeScript major-version, and broad UI-library upgrades.

## Test Strategy

### Unit Tests

Cover:

- Default fallback behavior.
- Safe application paths with query strings and fragments.
- External absolute URLs.
- Scheme-relative URLs.
- Backslash host escapes.
- Malformed URLs.
- Unsafe fallback inputs.

### Browser Tests

Cover:

- Unauthenticated `/dashboard` requests end at `/login`.
- An external callback `next` value never appears in a redirect location.
- Login renders without horizontal overflow at desktop and mobile sizes.
- Login produces no unexpected page or console errors.

### Completion Gates

- Unit tests pass.
- Browser tests pass.
- ESLint passes.
- TypeScript passes.
- Production build passes.
- Supabase reachability verification passes.
- `npm run audit:production` reports no high-severity production findings.
- Any development-only audit findings are reviewed and recorded without applying unsafe forced downgrades.

## Decision Log

| Decision | Alternatives | Rationale |
|---|---|---|
| Use a pure redirect-policy helper | Inline callback checks | Pure policy is easier to test exhaustively and reuse. |
| Use Vitest | Node built-in test runner | Better TypeScript ergonomics and alignment with the documented stack. |
| Add focused Playwright coverage | Manual browser QA only | The confirmed redirect regression needs repeatable request-level verification. |
| Perform targeted patch upgrades | Broad dependency refresh | Limits regression risk while resolving the immediate advisories. |
| Preserve the existing Supabase session-refresh behavior | Redesign auth architecture | The current architecture works; this slice should remain narrowly scoped. |

## Implementation Outcome

- Next.js, React, React DOM, and the paired Next.js ESLint configuration were upgraded to current compatible patch releases.
- Patched PostCSS and Sharp versions are pinned through package overrides because Next.js still accepts vulnerable transitive ranges.
- Production dependencies report zero known vulnerabilities.
- The full development audit reports a high-severity advisory chain through ESLint's legacy `minimatch` range even though the resolved `brace-expansion` packages are patched. npm's proposed forced remediation would install a breaking, obsolete Next.js ESLint configuration, so it was not applied.
