-- Initial Home Management OS schema.
-- Apply this in Supabase before wiring pilot data. RLS is enabled from the start.

create extension if not exists pgcrypto;

create type public.property_type as enum (
  'single_family_house',
  'condo',
  'coop',
  'apartment',
  'multi_family',
  'rental',
  'vacation_home',
  'other'
);

create type public.asset_system_category as enum (
  'roof',
  'hvac',
  'furnace',
  'boiler',
  'water_heater',
  'appliance',
  'electrical',
  'plumbing',
  'gutters',
  'windows',
  'chimney',
  'foundation',
  'deck',
  'driveway',
  'pool',
  'sump_pump',
  'septic_or_sewer',
  'irrigation',
  'garage',
  'security',
  'other'
);

create type public.estimated_age_range as enum (
  'zero_to_three_years',
  'four_to_seven_years',
  'eight_to_twelve_years',
  'thirteen_to_twenty_years',
  'over_twenty_years',
  'unknown'
);

create type public.asset_condition as enum (
  'excellent',
  'good',
  'fair',
  'poor',
  'unknown'
);

create type public.asset_status as enum (
  'good',
  'due_soon',
  'needs_attention',
  'missing_info'
);

create type public.maintenance_interval_unit as enum (
  'days',
  'weeks',
  'months',
  'years'
);

create type public.ownership_responsibility as enum (
  'owner',
  'hoa',
  'landlord',
  'tenant',
  'shared',
  'unknown'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  property_type public.property_type not null default 'single_family_house',
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'US',
  year_built integer check (year_built is null or (year_built >= 1600 and year_built <= 2200)),
  square_feet integer check (square_feet is null or square_feet > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  room_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_systems (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  name text not null,
  category public.asset_system_category not null default 'other',
  brand text,
  model text,
  serial_number text,
  install_year integer check (install_year is null or (install_year >= 1600 and install_year <= 2200)),
  install_date date,
  estimated_age_range public.estimated_age_range default 'unknown',
  last_service_date date,
  next_service_due_date date,
  maintenance_interval_value integer check (
    maintenance_interval_value is null or maintenance_interval_value > 0
  ),
  maintenance_interval_unit public.maintenance_interval_unit,
  expected_lifespan_years integer check (
    expected_lifespan_years is null or expected_lifespan_years > 0
  ),
  condition public.asset_condition not null default 'unknown',
  status public.asset_status not null default 'missing_info',
  estimated_replacement_cost numeric(12, 2) check (
    estimated_replacement_cost is null or estimated_replacement_cost >= 0
  ),
  ownership_responsibility public.ownership_responsibility not null default 'owner',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_user_id_idx on public.properties(user_id);
create index rooms_property_id_idx on public.rooms(property_id);
create index asset_systems_property_id_idx on public.asset_systems(property_id);
create index asset_systems_room_id_idx on public.asset_systems(room_id);
create index asset_systems_status_idx on public.asset_systems(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_properties_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

create trigger set_asset_systems_updated_at
before update on public.asset_systems
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.asset_systems enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can insert their own profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "Users can read their own properties"
on public.properties for select
using (user_id = auth.uid());

create policy "Users can create their own properties"
on public.properties for insert
with check (user_id = auth.uid());

create policy "Users can update their own properties"
on public.properties for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own properties"
on public.properties for delete
using (user_id = auth.uid());

create policy "Users can read rooms for their own properties"
on public.rooms for select
using (
  exists (
    select 1 from public.properties
    where properties.id = rooms.property_id
      and properties.user_id = auth.uid()
  )
);

create policy "Users can create rooms for their own properties"
on public.rooms for insert
with check (
  exists (
    select 1 from public.properties
    where properties.id = rooms.property_id
      and properties.user_id = auth.uid()
  )
);

create policy "Users can update rooms for their own properties"
on public.rooms for update
using (
  exists (
    select 1 from public.properties
    where properties.id = rooms.property_id
      and properties.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.properties
    where properties.id = rooms.property_id
      and properties.user_id = auth.uid()
  )
);

create policy "Users can delete rooms for their own properties"
on public.rooms for delete
using (
  exists (
    select 1 from public.properties
    where properties.id = rooms.property_id
      and properties.user_id = auth.uid()
  )
);

create policy "Users can read asset systems for their own properties"
on public.asset_systems for select
using (
  exists (
    select 1 from public.properties
    where properties.id = asset_systems.property_id
      and properties.user_id = auth.uid()
  )
);

create policy "Users can create asset systems for their own properties"
on public.asset_systems for insert
with check (
  exists (
    select 1 from public.properties
    where properties.id = asset_systems.property_id
      and properties.user_id = auth.uid()
  )
);

create policy "Users can update asset systems for their own properties"
on public.asset_systems for update
using (
  exists (
    select 1 from public.properties
    where properties.id = asset_systems.property_id
      and properties.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.properties
    where properties.id = asset_systems.property_id
      and properties.user_id = auth.uid()
  )
);

create policy "Users can delete asset systems for their own properties"
on public.asset_systems for delete
using (
  exists (
    select 1 from public.properties
    where properties.id = asset_systems.property_id
      and properties.user_id = auth.uid()
  )
);
