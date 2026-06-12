# Initial Database Schema

The initial Supabase schema is defined in:

```text
supabase/migrations/202606040001_initial_home_schema.sql
```

The initial schema migration and duplicate-prevention migration have been applied to the current Supabase project and verified with `npm run verify:supabase`.

Follow-up migrations:

```text
supabase/migrations/202606040002_dedupe_asset_systems.sql
```

The follow-up migration removes duplicate asset/system rows per property and adds a unique index on property, category, and normalized name.

After applying the migration and filling `.env.local`, run:

```bash
npm run verify:supabase
```

Current verification status:

- `profiles` reachable.
- `properties` reachable.
- `rooms` reachable.
- `asset_systems` reachable.
- Test property creation through RLS succeeded.
- Test asset-system creation through RLS succeeded.
- Test asset-system detail update through RLS succeeded.
- Custom asset-system creation uses the same property ownership check before insert.
- Asset-system removal uses an ownership-checked asset lookup before delete.
- Duplicate asset/system creation is prevented in app code and should also be enforced by the follow-up unique index migration.
- Duplicate asset/system insertion was tested and blocked by constraint error `23505`.

## Implemented Tables

### `profiles`

Purpose: app-level profile linked to Supabase Auth.

Key columns:

- `id`: references `auth.users(id)`.
- `name`
- `email`
- `created_at`
- `updated_at`

A trigger creates a profile row when a Supabase auth user is created.

### `properties`

Purpose: primary container for home records.

Key columns:

- `id`
- `user_id`: owner, references `auth.users(id)`.
- `name`
- `property_type`
- `address_line_1`
- `address_line_2`
- `city`
- `state`
- `postal_code`
- `country`
- `year_built`
- `square_feet`
- `notes`
- `created_at`
- `updated_at`

The dashboard reads all properties for the signed-in user, selects the active property from `property=<id>` when present, and lets users edit owned property details from More.

### `rooms`

Purpose: secondary organization within a property.

Key columns:

- `id`
- `property_id`
- `name`
- `room_type`
- `notes`
- `created_at`
- `updated_at`

Rooms are not yet exposed in the UI.

### `asset_systems`

Purpose: major home systems/assets such as roof, central AC, furnace, boiler, water heater, gutters, appliances, and similar records.

Key columns:

- `id`
- `property_id`
- `room_id`
- `name`
- `category`
- `brand`
- `model`
- `serial_number`
- `install_year`
- `install_date`
- `estimated_age_range`
- `last_service_date`
- `next_service_due_date`
- `maintenance_interval_value`
- `maintenance_interval_unit`
- `expected_lifespan_years`
- `condition`
- `status`
- `estimated_replacement_cost`
- `ownership_responsibility`
- `notes`
- `created_at`
- `updated_at`

Asset dashboard rows now read from `asset_systems`. The current UI creates starter records from the guided add flow, supports custom/repeatable asset creation, and uses Missing Info defaults for incomplete details.
The dashboard can update detail fields directly on `asset_systems`: `brand`, `model`, `serial_number`, `install_year`, `estimated_age_range`, `condition`, `last_service_date`, `maintenance_interval_value`, `maintenance_interval_unit`, `next_service_due_date`, `expected_lifespan_years`, `estimated_replacement_cost`, `ownership_responsibility`, `notes`, and `status`.
The dashboard can remove asset rows after typed `REMOVE` confirmation. Deletes remain protected by the `asset_systems` RLS policy and an app-level ownership check through the parent property.

Status calculation:

- Empty records with no useful details remain `missing_info`. Default ownership responsibility alone does not count as a useful detail.
- Brand, model, serial number, expected lifespan, estimated replacement cost, age, service, interval, due-date, condition, and notes can move an asset out of `missing_info`.
- `condition = poor` marks an asset `needs_attention`.
- A past `next_service_due_date` marks an asset `needs_attention`.
- A `next_service_due_date` within 30 days marks an asset `due_soon`.
- `condition = fair` marks an asset `due_soon`.
- Otherwise, assets with useful details are `good`.

Duplicate guard:

- App-side creation checks existing property assets before insert.
- Dashboard cards collapse duplicate rows defensively and show a small duplicate-hidden badge.
- Database-level uniqueness is enforced by `asset_systems_property_category_name_unique_idx` after the follow-up migration is applied.

## Enums

The migration creates enums for:

- `property_type`
- `asset_system_category`
- `estimated_age_range`
- `asset_condition`
- `asset_status`
- `maintenance_interval_unit`
- `ownership_responsibility`

These match the MVP data model where possible and keep important dashboard/reminder fields structured.

## RLS Policy Shape

RLS is enabled on every implemented table.

Ownership rules:

- `profiles`: users can read, insert, and update only their own profile row.
- `properties`: users can read, create, update, and delete only rows where `user_id = auth.uid()`.
- `rooms`: users can access rooms only through a property they own.
- `asset_systems`: users can access assets only through a property they own.

Do not disable RLS for app convenience. If a query fails, fix the policy or ownership column rather than bypassing the privacy boundary.

## TypeScript Types

Placeholder Supabase database types live in:

```text
src/types/database.ts
```

These should be replaced with generated Supabase types once the local/project CLI workflow is set up.
