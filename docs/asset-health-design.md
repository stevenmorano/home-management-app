# Asset Health Domain Design

Status: Implemented
Date: 2026-07-26

## Understanding Summary

- Create one shared, deterministic asset-health engine for dashboard reads and asset updates.
- Separate health from information completeness so unknown records are not presented as unhealthy.
- Include an asset in health scoring only when it has a known condition or an explicit next-service due date.
- Treat brand, model, age, cost, notes, maintenance intervals, and last-service dates as useful record details, but not evidence of current health.
- Show no numeric health score when no assets can be assessed.
- Evaluate date boundaries using the `America/New_York` calendar during the pilot.
- Keep this slice focused: no category-specific rules, automatic scheduling, database migration, or reminder system.

## Assumptions And Non-Functional Requirements

- Preserve the current assessable-status weights: Good `100`, Due Soon `72`, and Needs Attention `32`.
- Past due dates mean Needs Attention; today through 30 days means Due Soon.
- Missing Info assets are excluded from health scoring but included in health-coverage reporting.
- The pilot scale is hundreds of assets per property at most, so clear O(n) calculations are sufficient.
- Authentication, row-level security, and private ownership boundaries remain unchanged.
- Pure functions accept explicit dates so tests are deterministic.
- One framework-independent TypeScript module becomes the maintained source of truth.
- The implementation prioritizes predictable behavior and maintainability over premature category-specific precision.

## Approaches Considered

### 1. Shared pure domain module

Create a framework-independent module used by dashboard reads and server-action writes. Keep the database status column as a compatibility snapshot.

Selected because it provides one testable source of truth without introducing migration or database-function risk.

### 2. Database-owned calculation

Calculate status through a Postgres function or view.

Rejected for this slice because migrations, time-zone behavior, generated types, and database testing would expand the change substantially.

### 3. Dashboard-only cleanup

Extract only the dashboard calculations and leave the server action independent.

Rejected because it preserves two sources of truth.

## Final Design

### Domain Module

Add `src/lib/asset-health.ts` with normalized inputs that do not depend on Supabase row types.

The module will expose:

- `calculateAssetStatus(asset, today)`
- `calculateInformationCompleteness(assets)`
- `calculateHomeHealth(assets, today)`
- `getAssetHealthExplanation(asset, today)`
- `getPilotCalendarDate(now)`

Dashboard rows and form values will be mapped into the normalized input. The server action will use the shared status function when persisting the compatibility status snapshot.

### Status Rules

Rules are evaluated in this order:

1. Poor condition or a past due date becomes Needs Attention.
2. Fair condition or a due date from today through 30 days becomes Due Soon.
3. Good/excellent condition or a due date more than 30 days away becomes Good.
4. Everything else becomes Missing Info.

Invalid or absent due dates are ignored safely. Date-only values are compared as calendar days to avoid daylight-saving boundary errors.

### Home Health And Coverage

- No assets: no numeric score, `0/0` assessed, and an add-systems prompt.
- Assets with no assessable records: no numeric score, `0/N` assessed, and a prompt for condition or next-service dates.
- Mixed data: score only assessable assets and show `X of N systems assessed`.
- Needs Attention takes message priority, followed by Due Soon, then Good.
- The score circle shows an em dash when health is unavailable.
- Missing Info remains visible in status counts without being presented as proof of poor health.

## Testing Strategy

Unit coverage will include:

- Unknown assets with descriptive details.
- Good, excellent, fair, poor, and unknown conditions.
- Date boundaries at -1, 0, 30, and 31 days.
- Condition and due-date precedence.
- Invalid date handling.
- New York date conversion around daylight-saving changes.
- Empty, unassessable, mixed, and fully assessed homes.
- Weighted score, coverage counts, percentage, and summary-message precedence.

Existing browser security and responsive tests remain required. Authenticated health states will initially be covered through pure-domain tests to avoid mutating pilot data.

## Risks And Deferred Work

- The database `status` column remains a snapshot and may age between edits. Dashboard reads recalculate status, while a later database or reminder slice can address stored-state aging.
- `America/New_York` is pilot-specific and should eventually become a property or user preference.
- Category-specific assessment, inferred due dates, reminders, and scheduling remain deferred.

## Decision Log

| Decision | Alternatives | Rationale |
|---|---|---|
| Separate health and coverage | Penalize missing data in one score | Unknown information is not proof that a home is unhealthy. |
| Require condition or explicit next due date | Treat any detail as health evidence | Identity and notes do not establish current health. |
| Do not infer health from last service alone | Treat it as Good or infer a schedule | A past service date has no current meaning without condition or cadence. |
| Use a pure TypeScript domain module | Postgres function or page-only helper | Provides deterministic reuse without migration risk. |
| Use the New York calendar for the pilot | UTC or browser-local dates | Matches current users and keeps server calculations consistent. |
| Preserve current assessable weights | Redesign scoring weights | Limits this slice to correctness and clarity. |
| Keep the status column as a snapshot | Remove it in a migration | Preserves compatibility while the product model is still evolving. |

## Implementation Outcome

- `src/lib/asset-health.ts` is the shared source for status, explanation, score, coverage, and pilot-calendar calculations.
- Dashboard reads and asset-detail writes now use the same status rules.
- The home-health card shows an unavailable score when nothing is assessable and always presents assessed-system coverage separately.
- Unit coverage verifies status precedence, date boundaries, daylight-saving conversion, insufficient-data states, weighted scoring, coverage, and message priority.
- Unit tests, browser regressions, lint, TypeScript, production build, live Supabase verification, production audit, and diff validation passed on 2026-07-26.
