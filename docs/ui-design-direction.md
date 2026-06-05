# UI Design Direction

This document defines the current user-facing visual direction for the Home Management OS web app.

## Current Direction

### Aesthetic Name

HomeKeep Modern Care.

The app should feel like a premium consumer home-care app: bright, visual, friendly, and immediately understandable for homeowners who do not want to manage a database.

This replaces the earlier Quiet Ledger direction, which proved too old-school and muted for the desired product feel.

### Purpose

The dashboard should help a homeowner quickly understand:

- Is my home in good shape?
- What maintenance is coming up?
- Which systems do I have?
- What should I add or update next?

The product should feel guided and reassuring, not like admin software.

### Tone

Dominant tone: modern premium consumer app.

Secondary tone: friendly home-care assistant.

Avoid:

- Dry ledger/bookkeeping aesthetics.
- Dense forms visible by default.
- Generic SaaS analytics dashboards.
- Vague inventory rows like "Major appliances" when users really need Refrigerator, Dishwasher, Washer, Dryer, and similar individual records.

### DFII

Design Feasibility and Impact Index:

- Aesthetic Impact: 5
- Context Fit: 5
- Implementation Feasibility: 4
- Performance Safety: 5
- Consistency Risk: 2

DFII = 19 - 2 = 17.

This direction is excellent because it makes the app feel like a product normal homeowners can understand while still fitting the existing Next.js/Tailwind implementation.

### Differentiation Anchor

If the logo were removed, the app should be recognizable by:

- A colorful home health score card.
- Visual home-system rows with category icons.
- Clear status pills for Good, Due Soon, Needs Attention, and Missing Info.
- Fast, friendly quick actions.

The dashboard should feel closer to a modern mobile-first home-care app than a record ledger.

## Design System Snapshot

### Typography

Use a clean, modern sans-serif direction with strong weight contrast:

- Bold product/app headings.
- Friendly, readable body text.
- Compact but legible metadata labels.

Avoid serif-led editorial styling for the main app UI.

### Color

The palette should be bright and status-forward:

- Blue as the primary product color.
- Soft blue app background.
- White rounded cards.
- Green for Good.
- Orange for Due Soon.
- Red/clay for Needs Attention.
- Slate/gray for Missing Info.

Status colors should be obvious at a glance. They should not be muted into black-and-white.

### Shape And Depth

- Rounded, modern cards.
- Soft shadows.
- Icon tiles for systems.
- Large home health score card.
- Clear tappable rows and actions.

This should feel app-like and easy, not corporate.

## Dashboard Structure

### App Header

The header should feel branded and simple:

- HomeKeep-style brand treatment.
- Property context.
- Notifications.
- Account/sign out.

### Home Health

The first memorable dashboard element should be a colorful home health score card:

- Circular score.
- Friendly summary text.
- Status counts.
- Strong visual color.

### Upcoming Maintenance

Show a short list of due-soon or needs-attention items:

- Asset icon.
- Maintenance/action title.
- Due status.
- Good/Due Soon/Needs Attention pill.

### Quick Add

Expose obvious next actions:

- Add item.
- Note.
- Maintenance.
- Photo.

Some actions may remain non-functional placeholders until those product areas are implemented, but the dashboard should communicate the future interaction model.

### Home Systems

Home systems should show as visual rows:

- Icon/image tile.
- Name.
- Category.
- Last service.
- Next check.
- Status pill.
- Chevron/details affordance.

The full editor should remain hidden behind an expandable section or future detail page.

## Asset Creation UX

Avoid broad records that users cannot reason about.

Better:

- Refrigerator
- Dishwasher
- Range or oven
- Washer
- Dryer
- Back deck
- Pool deck
- Upstairs HVAC
- Downstairs HVAC

Use `category` for grouping and `name` for the actual thing the homeowner recognizes.

Current implementation improvement:

- Checklist appliance suggestions now create individual appliance records instead of one generic "Major appliances" record.
- Custom assets can represent multiple items in the same category by using specific names, such as "Back deck" and "Side deck."
- The guided add flow includes repeatable item cards for another refrigerator, dishwasher, HVAC system, deck, water heater, or custom item.
- Repeated items should be named by location or purpose, such as "Garage refrigerator," "Butler pantry dishwasher," "Upstairs HVAC," or "Back deck."

## Next Visual Target

This is the next design target before moving into new product domains.

### Aesthetic Refinement Name

HomeCare Glass.

This refinement keeps HomeKeep Modern Care, but pushes the screen closer to the reference mockup: softer glassy cards, richer icons, clearer touch targets, and less visible database structure.

### Purpose

The next UI pass should make the app easier for non-technical homeowners by answering:

- What should I tap next?
- What specific thing am I tracking?
- Is this item okay, due soon, or missing info?
- How do I add another similar item without understanding categories?

### Tone

Dominant tone: premium mobile-first home app.

Secondary tone: helpful household assistant.

Avoid:

- Form-heavy dashboard sections.
- Generic category records.
- Dense text explanations.
- Icons that feel like placeholders instead of meaningful object cues.

### DFII For This Pass

- Aesthetic Impact: 5
- Context Fit: 5
- Implementation Feasibility: 4
- Performance Safety: 5
- Consistency Risk: 2

DFII = 17.

Proceed fully, but keep the implementation scoped to dashboard, asset rows, and add-item UX. Do not introduce work records, reminders, uploads, or calendar functionality during this pass.

### Differentiation Anchor

The screen should be recognizable by its "home care cards":

- A large colorful home health card.
- Polished system rows with icon/image tiles.
- Friendly maintenance cards.
- A guided add-item chooser that speaks in household objects, not database categories.

## Next Implementation Spec

Use `senior-frontend` to implement this section.

### 1. Richer System Rows

Improve each home-system row so it feels more like the mockup:

- Larger object icon tile.
- Stronger name hierarchy.
- Compact status pill.
- Last service and next check in two small columns.
- Clear chevron/detail affordance.
- Better empty prompts:
  - "Add service date" instead of "Not added."
  - "Add next check" instead of "Not added."
  - "Add details" for Missing Info records.

System rows should be comfortable on desktop and tablet and should not look like admin cards.

Implementation status: implemented in the HomeCare Glass pass.

### 2. Category Icon Language

Use more specific visual language for common systems:

- HVAC: outdoor unit / snowflake.
- AC: snowflake.
- Furnace/heater: flame.
- Plumbing: faucet/drop.
- Electrical: lightning.
- Roof: roof shape.
- Gutters: gutter/drip.
- Deck: deck/boards.
- Windows: window.
- Appliances: appliance tile.

Use existing icon libraries first. Generated/real images can come later when uploads or image assets are intentionally added.

Implementation status: implemented with richer icon tiles and category-specific color treatments.

### 3. Add Item UX

Replace the current custom asset form feeling with a friendly add flow section:

- "Add a system or appliance"
- Suggested buttons/cards:
  - Refrigerator
  - Dishwasher
  - Range or oven
  - Washer
  - Dryer
  - HVAC system
  - Water heater
  - Deck
  - Roof
  - Custom item

For repeated categories, the UI should teach naming:

- "Back deck"
- "Front deck"
- "Upstairs HVAC"
- "Downstairs HVAC"
- "Basement water heater"

Do not require users to understand `category`. The UI can still save category behind the scenes.

Implementation status: implemented for the dashboard add flow. The guided add area now uses visual object cards, individual appliance suggestions, repeatable item cards, and examples for repeated systems. A fuller add-item drawer/page can come later.

### 4. Asset Detail Surface

Keep the current expandable record as a bridge, but make it feel like a detail panel:

- Header with icon, asset name, location/name hint, and status.
- Group fields into friendly sections.
- Use softer cards inside the expanded area.
- Delete/remove should be visually secondary and clearly dangerous.

Long-term target is a dedicated asset detail page or drawer like the HVAC Details screen in the mockup, but this pass can improve the expanded section first.

Implementation status: implemented as a friendlier expanded detail panel. Dedicated asset detail pages/drawers remain pending.

### 5. Mobile And Tablet Expectations

- Dashboard should feel mobile-first even on desktop.
- Main columns should not crowd each other.
- Quick actions should be thumb-friendly.
- Expanded editor fields should stack cleanly.
- No text should truncate important household object names unless the row still makes sense.

### 6. Acceptance Criteria

The pass is successful when:

- Status colors are obvious again.
- A non-technical user can tell how to add a refrigerator, second deck, or upstairs HVAC.
- Asset rows feel like home objects, not database records.
- Missing info states feel helpful, not broken.
- The dashboard feels closer to the supplied concept mockup while staying real and data-backed.

## Implementation Status

Implemented in the first HomeKeep Modern Care pass:

- Bright modern app palette.
- HomeKeep-style header.
- Home health score card.
- Upcoming maintenance list.
- Quick actions.
- Visual home systems list.
- Specific appliance checklist suggestions.
- Existing asset editor remains available behind expandable records.

Still pending:

- Authenticated screenshot QA with real seeded data.
- Detail pages or drawers for asset details.
- Real photos/uploads when storage is implemented.

## Differentiation Callout

This avoids generic UI by presenting the home as a living care dashboard with visual systems, status colors, and quick actions instead of a dry maintenance database.
