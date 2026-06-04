# Initial Database Schema

The initial Supabase schema is defined in:

```text
supabase/migrations/202606040001_initial_home_schema.sql
```

This migration has been applied to the current Supabase project and verified with `npm run verify:supabase`.

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

The dashboard currently reads the first property for the signed-in user.

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

Purpose: major home systems/assets such as roof, HVAC, water heater, gutters, appliances, and similar records.

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

Asset dashboard cards are still static placeholders until the next data-backed inventory step.

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
