# ADR 0001: Property Health Command Center

## Status

Accepted

## Context

The product could have been framed as a chore app, a generic task manager, an inventory vault, or a maintenance planner. The core user problem is that homeowners often forget expensive maintenance until something breaks.

## Decision

Use **Property Health Command Center** as the primary product approach.

The app opens around a visual property dashboard showing what is good, what is due soon, what needs attention, and what information is missing.

## Alternatives Considered

- Inventory Vault: strong for records, weaker for proactive maintenance.
- Maintenance Planner: strong for reminders, weaker for complete home context.
- Chore/task app: too generic and not aligned with costly homeowner problems.

## Consequences

- Dashboard quality is central to the product.
- Major assets/systems become first-class objects.
- Chores stay secondary.
- Data needs to support status calculations, not just static notes.

