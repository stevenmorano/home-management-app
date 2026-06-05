# UX Flows

## Design Principles

- Dashboard-first, not task-list-first.
- Mobile-first from the beginning, while still scaling well to tablet and desktop.
- Calm, premium, visual, and easy to navigate.
- The current visual direction is documented in `docs/ui-design-direction.md` as HomeKeep Modern Care.
- Structured inputs over freeform typing for important data.
- Optional detail depth: simple records for casual users, detailed records for meticulous users.
- Documents and photos are useful, but never required to get started.

## First-Run Onboarding

1. User creates account or signs in.
2. User creates first property.
3. App asks for property type:
   - Single-family house
   - Condo
   - Co-op
   - Apartment
   - Multi-family
   - Rental
   - Vacation home
   - Other
4. User enters basic home details.
5. App shows a guided starter add flow of common systems/assets for that property type.
6. User adds what they have, editing default names for specific items like Basement fridge or Back deck.
7. App creates starter asset/system records with Missing Info defaults.
8. User lands on the property dashboard with data-backed asset cards.
9. User optionally enters structured details later.

## Asset Setup Flow

Minimum useful asset:

- Asset/system name
- Category

Preferred structured details:

- Install/replacement year
- Estimated age range
- Last service date
- Condition
- Maintenance interval
- Next service due date
- Expected lifespan
- Estimated replacement cost
- Brand/model/serial number
- Ownership responsibility
- Contractor or installer

Unknown details should be stored as missing info and surfaced later.

Current implementation:

- Properties with no assets show a guided starter add flow based on `property_type`.
- Users can reopen the guided add flow from the dashboard with Add item.
- Starter items are compact multi-select object tiles, not one-time disabled checklist options.
- The first Add view lets users select many things they have at once.
- Bulk selected starter tiles create one `asset_systems` row per selected item, then send the user to Systems for review.
- Tapping a repeat/custom starter still opens one focused naming panel with an editable "Name in your home" field and a sensible default, such as Refrigerator, so users can rename it to Basement fridge before adding.
- Users can add custom assets/systems beyond the starter list by choosing a category and name.
- Users can add multiple items of the same type by giving each one a specific recognizable name, such as Garage refrigerator, Butler pantry dishwasher, Upstairs AC, Basement furnace, or Back deck.
- The add flow supports compact multi-select items from Popular picks and an expandable More home items section instead of showing many mini-forms at once.
- Heating/cooling starters are specific user-facing items, such as Central AC, Heat pump, Mini-split, Furnace, Fireplace, Thermostat, and Water heater, instead of one vague HVAC choice.
- New starter assets default to `status = missing_info`, `condition = unknown`, `estimated_age_range = unknown`, and `ownership_responsibility = owner`.
- Dashboard asset cards read from Supabase.
- Dashboard asset cards show compact record summaries by default, including next action and status reason.
- Dashboard asset cards link to a focused Systems detail view at `/dashboard?tab=systems&asset=<id>`.
- The detail view uses a Service Passport layout with a hero, status badge, service metrics, status explanation, notes, record profile, and compact edit area.
- The detail view exposes the full details form for brand, model, serial number, install year, estimated age, condition, last service date, next service due date, maintenance interval, expected lifespan, estimated replacement cost, ownership responsibility, and notes.
- The detail view includes a typed confirmation remove flow for deleting an asset from the property inventory.
- The Systems list stays compact on phones because long edit forms are no longer embedded in every row.
- The Add item path keeps inventory setup open-ended instead of treating the first starter selection as final.

## Dashboard Flow

When a user opens a property, they should see:

- Active property and property switcher.
- Visual home health summary.
- Good assets.
- Due Soon assets/reminders.
- Needs Attention assets/reminders.
- Missing Info prompts.
- Recent work history.

The dashboard should make the next best action obvious without overwhelming the user.

Current implementation:

- Status counts are calculated from saved asset/system rows.
- Status counts are shown in a colorful Home Health score card.
- Upcoming maintenance surfaces Due Soon and Needs Attention items before the full inventory.
- Dashboard uses focused app-style sections: Home, Systems, Add, and More.
- Phone layout includes bottom navigation so users do not scroll through every dashboard surface at once.
- Home is a compact summary with home health, upcoming maintenance, quick actions, and a systems preview.
- Systems contains the full inventory and selected-asset detail/edit views.
- Add contains the compact multi-select starter flow plus focused repeat/custom naming.
- More contains property/account utility surfaces.
- The dashboard/sidebar split is reserved for wider desktop screens; tablet and smaller layouts prioritize focused sections and a single readable column.
- Asset records with unknown or incomplete details remain Missing Info.
- Saving useful details moves an asset out of Missing Info unless condition or due-date rules indicate another status.
- Poor condition or overdue service marks an asset Needs Attention.
- Service due within 30 days or Fair condition marks an asset Due Soon.

## Work History Flow

Fast work record entry:

1. What was done?
2. When was it done?
3. Who did it: DIY, household member, or contractor?
4. What did it cost?
5. What property/asset/room does it relate to?
6. Optional notes, documents, and photos.

## Reminder Flow

Reminder creation should support:

- One-time reminder.
- Recurring reminder.
- Seasonal reminder.
- Review/replacement planning reminder.
- Google Calendar sync toggle.

Calendar-worthy examples:

- Central AC service.
- Boiler service.
- Chimney inspection.
- Gutter cleaning.
- Roof inspection.
- Contractor appointment.
- Warranty expiration.

## Multi-Property Flow

- Property switcher is visible from the dashboard.
- Adding a second property should not disrupt the first property.
- Global views can come later. MVP can focus on per-property dashboards.
