# Work History Foundation Design

Status: Implemented and verified
Date: 2026-07-28

## Understanding Summary

- Add a focused Maintenance screen opened from the Home dashboard's Quick Add area.
- Let homeowners create, view, edit, and delete completed work records.
- Capture work type, title, completed date, performer, optional provider name, cost,
  linked asset or room, description, and notes.
- Advance a linked asset's `last_service_date` when newer completed work is saved.
- Leave `next_service_due_date` unchanged.
- Keep all work history private through property-scoped Supabase row-level security.
- Leave contractor profiles, reminders, calendar sync, documents, and photos for
  later slices.

## Assumptions And Non-Functional Requirements

- The first audience remains the family-and-friends pilot.
- The Maintenance screen loads the latest 25 records for the active property.
- Pagination is deferred until record counts make it necessary.
- Older historical records never overwrite a newer asset service date.
- Editing or deleting a record does not move the asset service date backward.
- Deletes require typing `REMOVE`.
- Cross-property asset and room links are rejected.
- Costs use exact decimal values and default to USD.
- Property/date, asset, and room indexes support the expected read paths.
- Database migrations and TypeScript types remain versioned in the repository.
- The permanent automation account owns isolated browser-test fixtures, which are
  removed through property cascade cleanup.

## Approaches Considered

### 1. Dedicated Maintenance dashboard state

Use `/dashboard?tab=maintenance` within the existing URL-driven dashboard
architecture. Keep the screen in an extracted server component so it can become a
separate route later.

Selected for consistency with the current product shell and the fastest safe pilot
implementation.

### 2. Separate Maintenance route

Use `/dashboard/maintenance` with a shared dashboard layout.

Deferred because the current dashboard is organized around URL tabs and this would
introduce a second navigation model before the shell is ready to be restructured.

### 3. Quick-entry modal with asset-embedded history

Open maintenance entry in a client-side modal and treat Service Passports as the
primary history surface.

Rejected because it weakens property-wide history, URL navigation, accessibility,
editing, and browser-test reliability.

## Data Model

Migration `202607280001_work_records.sql` adds:

- `work_type`: `maintenance`, `repair`, `inspection`, `upgrade`, `replacement`, or
  `other`.
- `performed_by_type`: `diy`, `household_member`, `contractor`, or `other`.
- `work_records` with:
  - `id`
  - `property_id`
  - nullable `asset_system_id`
  - nullable `room_id`
  - `performed_by_type`
  - nullable `provider_name`
  - `title`
  - `work_type`
  - nullable `description`
  - `completed_date`
  - nullable `cost_amount`
  - `cost_currency`, defaulting to `USD`
  - nullable `notes`
  - `created_at`
  - `updated_at`

Deleting a property cascades its history. Deleting an asset or room preserves the
history record and clears the optional link.

RLS policies allow reads and mutations only through an owned parent property.
Database validation rejects linked assets or rooms from another property.

Indexes cover recent property history, asset history, and room history. A database
trigger advances a linked asset's `last_service_date` only when the completed date is
newer. The record mutation and service-date update share one transaction.

## User Experience

The Maintenance Quick Add tile opens:

```text
/dashboard?property=<id>&tab=maintenance&mode=new
```

The focused screen retains the existing HomeKeep shell and property switcher without
adding a fifth permanent navigation item.

The form includes:

- Active property context.
- Optional asset and room selectors scoped to that property.
- Work type.
- Title.
- Completed date.
- Performer type.
- Optional provider name.
- Optional cost.
- Description.
- Notes.

The screen shows recent history below the form. Existing records open with a
`record=<uuid>` query parameter. The same form supports edits, cancellation, and a
separate typed-confirmation delete area.

Successful actions redirect to the Maintenance screen with a concise status message.
Home shows the latest three completed records. A selected Service Passport shows its
latest linked records.

The form is one column on phones and uses grouped two-column fields on larger
viewports. It requires no modal state or client-side data fetching.

## Validation And Failure Handling

- Title is required and limited to 120 characters.
- Completed date is required, uses `YYYY-MM-DD`, and cannot be in the future.
- Cost is optional, non-negative, and stored to two decimal places.
- Currency is fixed to USD for the pilot.
- Asset and room values must be valid UUIDs belonging to the active property.
- Provider name, description, and notes use practical length limits.
- Create, update, and delete re-check authentication, property ownership, record
  ownership, and linked-record ownership.
- Database errors become friendly redirects without exposing internal details.
- Delete requires the exact confirmation text `REMOVE`.

## Testing Strategy

- Unit-test parsing, allowlists, date boundaries, cost boundaries, and text limits.
- Add authenticated browser coverage for entry through Quick Add.
- Verify history on Maintenance and Home.
- Verify linked history in a Service Passport.
- Edit a record and verify the updated content.
- Verify forward-only service-date synchronization.
- Delete with typed confirmation and verify removal.
- Reject cross-property asset and room links.
- Reject page errors, console errors, and horizontal overflow on mobile.
- Remove the fixture property and its work records after the scenario.
- Preserve the existing unit, browser, lint, type, build, production-audit, and live
  Supabase verification gates.

## Risks

- Database migration application is required before the UI can query work records.
- The existing dashboard page is large, so Maintenance UI should be extracted rather
  than added as another large inline block.
- Asset service dates are a compatibility field as well as derived history context;
  forward-only synchronization avoids destructive rollback ambiguity.
- The pilot Supabase project contains personal and historical QA data. Migration and
  tests must remain additive, RLS-scoped, and isolated to the automation account.

## Decision Log

| Decision | Alternatives | Rationale |
|---|---|---|
| Use `tab=maintenance` | Separate route; modal | Matches the current dashboard architecture. |
| Extract the Maintenance screen | Add another large inline block | Keeps a future route split practical. |
| Store provider name on each record | No name; contractor directory now | Useful immediately without expanding the slice. |
| Implement full CRUD | Create/view only; create/view/delete | Homeowners need to correct historical records. |
| Advance only `last_service_date` | No asset sync; calculate next due date | Useful automation without making scheduling assumptions. |
| Never move service date backward | Recompute on every edit/delete | Preserves newer facts and avoids destructive ambiguity. |
| Use property-scoped RLS | Application filtering only; service-role mutations | Maintains database-enforced privacy. |
| Preserve records when asset/room is deleted | Cascade work history | Historical work remains useful without the linked object. |
| Fix currency to USD for pilot | Currency selector | Avoids unnecessary complexity for the current audience. |
| Load the latest 25 records | Full pagination now | Sufficient for pilot scale while preserving an indexed path. |

## Verification

Verified on 2026-07-28:

- Migration applied successfully to the existing Supabase pilot project.
- `profiles`, `properties`, `rooms`, `asset_systems`, and `work_records` are reachable.
- 47 unit tests passed.
- 8 Playwright tests passed.
- Authenticated maintenance coverage passed for create, Home history, Service Passport
  history, edit, forward-only service dates, cross-property rejection, typed deletion,
  mobile overflow, and fixture cleanup.
