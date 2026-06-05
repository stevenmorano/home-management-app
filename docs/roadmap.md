# Roadmap

## Phase 0: Documentation And Planning

- Product design. Complete.
- Product requirements. Complete.
- UX flows. Complete.
- Data model. Complete.
- Architecture plan. Complete and now tracking current scaffold state.
- Security/privacy plan. Complete and should be updated as auth/storage details are implemented.
- Implementation plan. Complete and now tracking current build status.

## Phase 1: Prototype Foundation

- Select stack. Complete.
- Create app scaffold. Complete.
- Set up auth. Foundation complete.
- Set up database. Initial migration applied and verified against Supabase.
- Create property model. Initial table and first-property flow complete.
- Create asset/system model. Initial table and guided checklist creation flow complete.
- Build first dashboard shell. Protected shell complete with data-backed property and asset context.

## Phase 2: Guided Inventory MVP

- Property type onboarding. Started through first-property setup.
- Guided asset checklist by property type. Complete for the current prototype.
- Custom asset/system creation. Complete for the current prototype.
- Repeatable same-type item creation. Complete through specific-name add cards for another refrigerator, dishwasher, HVAC system, deck, water heater, or custom item.
- Structured asset entry. Expanded editing complete for identity, age, condition, service dates, next due date, maintenance interval, expected lifespan, replacement cost, ownership responsibility, and notes.
- Missing info status. Default Missing Info creation and richer useful-detail status logic complete.
- Multi-property switcher. Pending.

## Phase 3: Home Health Dashboard

- Status groups: Good, Due Soon, Needs Attention, Missing Info. Data-backed counts and status reasons implemented.
- HomeKeep Modern Care visual dashboard. First pass complete.
- HomeCare Glass refinement. Implemented for richer system rows, missing-info prompts, compressed repeatable add-item UX, and friendlier detail surfaces.
- Mobile-first dashboard shell. Implemented with Home, Systems, Add, and More sections plus phone bottom navigation.
- Asset rows. Data-backed visual system rows implemented with icon tiles, last service, next check, status, and links to focused detail views.
- Upcoming maintenance. Data-backed from due-soon/needs-attention asset status.
- Overdue items.
- Recently completed work.
- Premium mobile/tablet layout. Authenticated mobile screenshot QA and first polish pass complete; next refinement is a more focused Add flow that avoids showing many mini-forms at once.

## Phase 4: Work History And Contractors

- Work record creation.
- Contractor records.
- Link work to assets, rooms, properties, and contractors.
- Basic home history timeline.

## Phase 5: Reminders And Google Calendar

- In-app reminders.
- Recurring/seasonal/review reminders.
- Google Calendar OAuth.
- Push selected reminders/events to Google Calendar.
- Store calendar event IDs.

## Phase 6: Optional Records Vault

- Private document/photo uploads.
- Link files to assets, work records, properties, contractors, and rooms.
- Basic export/backup if practical.

## Phase 7: Family/Friends Pilot

- Seed demo property templates.
- Invite pilot users.
- Gather feedback.
- Track whether users complete inventory and return for reminders.
- Fix workflow friction.

## Later

- AI home analysis.
- AI invoice parsing.
- Maintenance templates.
- Paid tiers or subscriptions.
- Contractor recommendations.
- Native mobile app.
- Resale/insurance reports.
- Guest/contractor access.
