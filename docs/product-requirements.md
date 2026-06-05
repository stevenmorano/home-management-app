# Product Requirements

## Product Summary

The Home Management Operating System helps homeowners keep track of the major things their home depends on: roof, central AC, heat pump, furnace, boiler, water heater, appliances, gutters, electrical, plumbing, deck, driveway, pool, and similar assets/systems.

The MVP is not primarily a chore app. It is a home inventory, maintenance, reminder, and work-history system designed to help users avoid expensive surprises.

## Target Users

- Homeowners in high-cost-of-living areas.
- Families who need a shared view of home maintenance.
- People with older homes or costly systems.
- People who do not currently track maintenance reliably.
- People with one or more properties, including rentals, apartments, vacation homes, or family-managed homes.

## Success Signals

- Users complete a basic inventory of major home assets/systems.
- Users identify maintenance they would otherwise have forgotten.
- Users return because the dashboard and reminders are useful.
- Users log real work history over time.
- Users say the app feels easier and more useful than notes, spreadsheets, or memory.

## MVP Requirements

### Accounts

- Users can create private authenticated accounts.
- User data is private by default.

### Properties

- Users can create multiple properties.
- Onboarding starts with one primary property.
- Users can switch between properties easily.
- Properties include type, address or general location, year built, square footage, and notes.

### Guided Inventory

- First setup asks for property type.
- The app presents a broad checklist of common systems/assets based on property type.
- Users can select known items, skip unknown items, and return later.
- Users can add custom assets/systems.
- Users can add individual appliance records rather than one vague "major appliances" record.
- Users can add multiple same-type items by giving each item a specific name, such as Garage refrigerator, Butler pantry dishwasher, Upstairs AC, Basement furnace, or Back deck.

### Assets And Systems

- Users can track major home assets/systems.
- Records support simple and detailed entry.
- Key fields include category, name, brand, model, serial number, install/replacement year, estimated age range, last service date, next due date, condition, maintenance interval, expected lifespan, estimated replacement cost, ownership responsibility, and notes.
- The user-facing item name should be the thing a homeowner recognizes, while category remains the structured grouping behind it.

### Dashboard

- Users see a visual property health dashboard.
- Dashboard navigation is mobile-first, with focused Home, Systems, Add, and More sections instead of one long phone page.
- Dashboard status groups are Good, Due Soon, Needs Attention, and Missing Info.
- Dashboard surfaces upcoming maintenance, overdue items, expensive future items, recently completed work, and missing details.
- Current dashboard direction is HomeKeep Modern Care with a home health score, upcoming maintenance, quick actions, and visual home-system rows.

### Work History

- Users can log work done on the home.
- Work records can represent DIY work, contractor work, maintenance, repairs, inspections, upgrades, and replacements.
- Work records can link to properties, assets/systems, rooms, contractors, documents/photos, and costs.

### Contractors

- Users can store service providers and contractors.
- Contractor records include name/company, trade, phone, email, website, rating, would-use-again, notes, and linked work history.

### Documents And Photos

- Users can optionally upload documents and photos.
- Uploads are not required during onboarding.
- Attachments can link to properties, assets/systems, work records, contractors, and rooms.

### Reminders And Calendar

- Users can create in-app reminders.
- Selected reminders/events can sync to Google Calendar.
- Reminders support one-time, recurring, seasonal, and review/replacement planning cases.

## MVP Non-Goals

- AI analysis or AI invoice parsing.
- Contractor marketplace.
- Billing, subscriptions, or paywalls.
- Native mobile app.
- Child chore points or rewards.
- Guest/contractor portal.
- Complex project management.
- Full admin/support tooling.
