# UX Flows

## Design Principles

- Dashboard-first, not task-list-first.
- iPad/tablet-friendly from the beginning.
- Calm, premium, visual, and easy to navigate.
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
5. App shows a guided checklist of common systems/assets for that property type.
6. User selects what they have.
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
- Expected lifespan
- Estimated replacement cost
- Brand/model
- Contractor or installer

Unknown details should be stored as missing info and surfaced later.

Current implementation:

- Properties with no assets show a guided checklist based on `property_type`.
- Users can reopen the checklist from the dashboard with Add more systems.
- Already-added checklist items are disabled and marked Already added.
- Selected checklist items create `asset_systems` rows.
- New checklist assets default to `status = missing_info`, `condition = unknown`, `estimated_age_range = unknown`, and `ownership_responsibility = owner`.
- Dashboard asset cards read from Supabase.
- Dashboard asset cards include a lightweight details form for install year, estimated age, condition, last service date, and notes.
- The Add more systems path keeps inventory setup open-ended instead of treating the first checklist submission as final.

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
- Asset records with unknown or incomplete details remain Missing Info.
- Saving useful details moves an asset out of Missing Info unless condition is Poor, which marks it Needs Attention.

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

- HVAC service.
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
