# ADR 0003: Calendar Sync In MVP

## Status

Accepted

## Context

Home maintenance reminders only work if they reach users where they already manage time. In-app reminders are useful, but major maintenance, inspections, and contractor appointments often belong on a calendar.

## Decision

Include Google Calendar sync in the MVP direction for selected reminders and events.

Early implementation can be one-way push from the app to Google Calendar, storing provider event IDs for future updates.

## Alternatives Considered

- In-app reminders only.
- Email reminders first.
- Calendar sync as a later placeholder only.

## Consequences

- MVP complexity increases because OAuth and calendar event storage are required.
- Calendar sync should be user-controlled.
- Not every reminder should sync by default.
- Contractor appointments, maintenance visits, inspections, bill/admin dates, and high-priority home events should default toward sync.

