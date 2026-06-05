# Home Management Operating System - Product Design

## Understanding Summary

- The app is a home management operating system for homeowners, especially people in high-cost-of-living areas where home maintenance failures can become expensive quickly.
- The MVP focuses on home inventory, major systems/assets, maintenance reminders, work history, contractors, and records.
- Chores and small room tasks are secondary. They can exist, but they should not define the product.
- The main user promise is: open the app and see what in the home is good, what needs attention soon, what is missing info, and what might become costly.
- Users should be guided through a broad checklist of common home assets/systems based on property type, with the ability to skip unknown details and complete them later.
- Documents, photos, receipts, manuals, and warranties are optional attachments, not required onboarding steps.
- The first pilot is for family and friends, but the app should be structured so it can later become a public SaaS product.

## Assumptions

- The product starts as a web app, optimized especially for iPad/tablet use, while still supporting phone and desktop layouts.
- The app supports multiple properties, but the first onboarding flow starts with one primary property.
- In-app reminders and Google Calendar sync are part of the MVP direction.
- Authentication and private user-owned data are required.
- Uploaded documents/photos are private and optional.
- AI analysis is a later feature. The MVP should collect clean structured data manually so AI can analyze it later.
- Billing, subscriptions, paywalls, public launch admin tooling, advanced AI, and native mobile apps are deferred.
- The pilot should be trustworthy enough that user data does not disappear, while avoiding enterprise-grade operational complexity too early.

## Decision Log

| Decision | Alternatives Considered | Rationale |
| --- | --- | --- |
| Focus MVP on homeowners and major home systems/assets | Chore app, generic task manager, project management app | The strongest pain is expensive maintenance being forgotten until something breaks. |
| Choose "Property Health Command Center" as the product approach | Inventory Vault, Maintenance Planner | It best matches the desired first impression: visual home status, attention areas, and proactive maintenance. |
| Make chores secondary | Chore-first family app | Chores are useful but would dilute the core positioning around costly home maintenance. |
| Start onboarding with property type | Generic property setup | Houses, condos, apartments, rentals, and vacation homes need different default checklists. |
| Use a guided broad checklist | Empty manual database, rigid wizard only | Users should not need to invent every asset manually, but they also need flexibility and the ability to skip. |
| Keep asset data structured | Freeform guesses in notes | Standardized dates, year pickers, age ranges, condition fields, and dropdowns keep the dashboard, reminders, and future AI reliable. |
| Support optional uploads from MVP | Required receipt/photo upload, no uploads until later | Uploads are valuable for detailed users but should not make onboarding feel like homework. |
| Support multiple properties | One property only | Some users may manage rentals, apartments, vacation homes, or family properties. |
| Include Google Calendar sync | In-app only, email only, later placeholder | Calendar integration is important for real-world maintenance and contractor appointments. |
| Pilot before full SaaS | Full production SaaS from day one | Family/friends testing should validate usefulness before billing, admin, and support complexity. |

## Product Shape

The app opens to a property-focused dashboard rather than a generic task list. At the top, the user sees the active property and a property switcher. If the user only has one home, the switcher stays quiet. If they have multiple properties, switching should be fast and obvious.

The dashboard acts as a visual health overview of the home. It shows major systems/assets such as roof, HVAC, boiler, water heater, gutters, appliances, electrical, plumbing, windows, deck, driveway, pool, and similar items as clear status cards or tiles.

The primary user loop is:

1. Add property.
2. Select property type.
3. Choose common systems/assets from a guided checklist.
4. Fill in what is known using structured inputs.
5. See the home health dashboard.
6. Receive reminders and calendar events for maintenance or review.
7. Log work history over time.

## Onboarding And Setup

First-run onboarding begins by asking for property type:

- Single-family house
- Condo
- Co-op
- Apartment
- Multi-family
- Rental
- Vacation home
- Other

The selected property type controls the suggested checklist. For a single-family house, the checklist may include roof, gutters, HVAC, furnace/boiler, water heater, plumbing, electrical panel, major appliances, chimney, foundation, windows, deck, driveway, sump pump, septic/sewer, irrigation, pool, and garage systems. For a condo or apartment, the checklist should de-emphasize roof/foundation and emphasize appliances, HVAC units, water heater if owned, electrical panel, fixtures, smoke detectors, windows, and maintenance responsibilities.

Users should be able to add an item with minimal data, but the data should remain structured. Instead of typing vague notes like "maybe around 2001," the app should offer fields such as:

- Installed/replaced year
- Exact service date
- Estimated age range: 0-3 years, 4-7 years, 8-12 years, 13-20 years, 20+ years
- Unknown
- Condition
- Maintenance interval
- Estimated replacement cost

Notes can exist, but they should not carry the main data needed for reminders, dashboards, reports, or future AI.

## Core Data Objects

### Property

The property is the container for everything else. It includes type, address or general location, year built, size, ownership/use type, notes, assets, rooms, work records, reminders, documents, contractors, and household members.

### Asset/System

Asset/System is the central object. It includes roof, HVAC, boiler, water heater, appliances, electrical panel, plumbing, gutters, windows, deck, driveway, pool, and other costly or maintenance-relevant items.

Important fields include:

- Category
- Name
- Brand
- Model
- Serial number
- Install/replacement year
- Estimated age range
- Last service date
- Next maintenance due
- Expected lifespan
- Condition
- Status
- Estimated replacement cost
- Ownership responsibility
- Notes

### Work Record

Work records track anything done to the home, including maintenance, repairs, inspections, DIY work, upgrades, and replacements.

Examples:

- Cleaned gutters
- Serviced HVAC
- Replaced water heater
- Installed deck
- Redid driveway
- Repaired plumbing
- Opened pool

Work records should link to a property and optionally to an asset/system, room, contractor/person, cost, documents/photos, and notes.

### Reminder

Reminders track upcoming maintenance, inspections, reviews, and replacement planning. They can be generated from assets or work records and can sync to Google Calendar.

### Room

Rooms are secondary organization for smaller maintenance, chores, issues, appliances, and location context.

### Contractor

Contractors are reusable contacts linked to work records, assets, properties, and documents.

### Document

Documents and photos are optional attachments for properties, assets, rooms, work records, contractors, and future reports.

## Dashboard

The dashboard should feel premium, calm, and visual. It should avoid feeling like a spreadsheet or corporate task board.

The accepted visual direction is HomeKeep Modern Care, documented in `docs/ui-design-direction.md`. It frames the dashboard as a bright, premium, consumer home-care app with strong status colors and visual system rows.

The recommended dashboard groups are:

- Good: items with known info and no upcoming maintenance concerns.
- Due Soon: maintenance or review coming up.
- Needs Attention: overdue service, poor condition, high priority, or likely replacement planning.
- Missing Info: important assets where the user has not entered enough detail yet.

Each asset/system tile should show:

- Icon
- Name
- Status color
- Last service or replacement info
- Next action or due date
- Optional confidence/completeness indicator

The dashboard should also surface:

- Upcoming maintenance
- Overdue items
- Expensive future items
- Recently completed work
- Missing details to fill in later
- Google Calendar sync status

The goal is instant orientation: what is okay, what needs attention, and what should be done next.

## Reminders And Calendar

Reminders should focus on maintenance, review, and replacement planning rather than generic chores.

Reminder types:

- One-time reminder
- Recurring reminder
- Seasonal reminder
- Review/replacement planning reminder

Reminder statuses:

- Active
- Completed
- Skipped
- Snoozed

Google Calendar sync should be user-controlled. Contractor appointments, maintenance visits, inspections, bill/admin dates, and high-priority home events should default toward calendar sync. Lower-stakes items can stay in-app unless the user opts in.

Calendar events should include:

- Property name
- Asset/system
- Due date
- Contractor, if relevant
- Notes
- Link back to the app item

The earliest viable implementation can push selected reminders/events to Google Calendar and store the calendar event ID for future updates.

## Records, Contractors, And Work History

Work history should be simple to log. A homeowner should be able to record what was done, when, who did it, what it cost, and what it relates to in under a minute.

Example records:

- Cleaned gutters, October 2026, DIY, $0, linked to Gutters.
- Serviced boiler, November 2026, ABC Heating, $275, linked to Boiler.

Contractors should include:

- Company/name
- Trade
- Phone
- Email
- Website
- Rating
- Would use again
- Notes
- Linked work records

The long-term home history view should become a chronological timeline of purchases, installations, repairs, inspections, maintenance, upgrades, and major projects.

## Non-Functional Requirements

### Performance

Dashboards, asset lists, property switching, and common views should feel fast for normal household use. The pilot should comfortably handle hundreds of records per property.

### Scale

The first target is a family/friends pilot, likely dozens of users. The system should be able to grow toward public SaaS use later without adding SaaS complexity too early.

### Security And Privacy

The app may contain addresses, home systems, contractor contacts, costs, documents, invoices, warranties, and photos. The MVP should include authentication, private user-owned data, protected file uploads, and no public sharing by default.

### Reliability

The app should be a trustworthy beta. Data should persist reliably, and users should not feel that records may disappear. Basic backup/export should be considered early.

### Maintenance

The architecture should be simple enough for one person to operate during the pilot. Avoid unnecessary services, complex infrastructure, and AI features before the core workflow is validated.

## MVP Scope

Include:

- Auth/private accounts
- Multiple properties, with one-property onboarding by default
- Property type setup
- Guided asset/system checklist
- Asset/system records with structured dates, age ranges, condition, cost, brand/model, and maintenance intervals
- Dashboard with Good, Due Soon, Needs Attention, and Missing Info
- Work history records
- Contractors
- Optional document/photo uploads
- In-app reminders
- Google Calendar sync for selected reminders/events
- Basic rooms as secondary organization
- Basic export/backup, if practical

Defer:

- AI invoice parsing
- AI home analysis
- Contractor marketplace/recommendations
- Paid subscriptions/paywalls
- Child chore rewards
- Guest/contractor access
- Native mobile app
- Complex project management
- Advanced resale/insurance reports
- Full admin/support tooling

## Key Risks

- Scope creep into a generic project/task/chore app.
- Onboarding becoming too much like homework.
- Dashboard becoming too text-heavy instead of visual and calming.
- Google Calendar integration increasing MVP complexity.
- Users not knowing enough asset details at setup, requiring a strong missing-info workflow.
- Uploads creating storage/security complexity before users prove they need them.

## Implementation Handoff Notes

Recommended next step is to define the first technical plan around:

1. Stack selection.
2. Data model.
3. Onboarding flow.
4. Dashboard prototype.
5. Reminder/calendar integration strategy.
6. Pilot deployment approach.
