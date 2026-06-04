# ADR 0002: Structured Guided Home Inventory

## Status

Accepted

## Context

Users should not need to manually invent every home system or type vague guesses into text fields. At the same time, many users will not know exact install dates, service dates, model numbers, or warranty details.

## Decision

Use a guided broad checklist based on property type, with structured inputs and skip-and-return behavior.

Important data should use fields like year pickers, date pickers, age ranges, condition dropdowns, cost fields, and status values. Notes are allowed but should not carry core maintenance data.

## Alternatives Considered

- Empty database with manual entry only.
- Rigid step-by-step wizard requiring complete data.
- Freeform notes for unknown details.

## Consequences

- Onboarding can be useful without feeling like homework.
- The dashboard can calculate status consistently.
- Future AI and reports will have cleaner data.
- The app needs a strong Missing Info workflow.

