-- Add private, property-scoped work history.

create type public.work_type as enum (
  'maintenance',
  'repair',
  'inspection',
  'upgrade',
  'replacement',
  'other'
);

create type public.performed_by_type as enum (
  'diy',
  'household_member',
  'contractor',
  'other'
);

create table public.work_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  asset_system_id uuid references public.asset_systems(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  performed_by_type public.performed_by_type not null default 'diy',
  provider_name text check (
    provider_name is null or char_length(provider_name) <= 160
  ),
  title text not null check (
    char_length(btrim(title)) between 1 and 120
  ),
  work_type public.work_type not null default 'maintenance',
  description text check (
    description is null or char_length(description) <= 4000
  ),
  completed_date date not null,
  cost_amount numeric(12, 2) check (
    cost_amount is null or cost_amount >= 0
  ),
  cost_currency text not null default 'USD' check (
    cost_currency ~ '^[A-Z]{3}$'
  ),
  notes text check (
    notes is null or char_length(notes) <= 4000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index work_records_property_recent_idx
on public.work_records(property_id, completed_date desc, created_at desc);

create index work_records_asset_system_id_idx
on public.work_records(asset_system_id)
where asset_system_id is not null;

create index work_records_room_id_idx
on public.work_records(room_id)
where room_id is not null;

create or replace function public.validate_work_record()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.completed_date > current_date then
    raise exception 'Completed date cannot be in the future';
  end if;

  if new.asset_system_id is not null and not exists (
    select 1
    from public.asset_systems
    where asset_systems.id = new.asset_system_id
      and asset_systems.property_id = new.property_id
  ) then
    raise exception 'Linked asset must belong to the work record property';
  end if;

  if new.room_id is not null and not exists (
    select 1
    from public.rooms
    where rooms.id = new.room_id
      and rooms.property_id = new.property_id
  ) then
    raise exception 'Linked room must belong to the work record property';
  end if;

  return new;
end;
$$;

create trigger validate_work_record_before_write
before insert or update of property_id, asset_system_id, room_id, completed_date
on public.work_records
for each row execute function public.validate_work_record();

create or replace function public.advance_asset_last_service_date()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.asset_system_id is not null then
    update public.asset_systems
    set last_service_date = case
      when last_service_date is null or new.completed_date > last_service_date
        then new.completed_date
      else last_service_date
    end
    where asset_systems.id = new.asset_system_id
      and asset_systems.property_id = new.property_id;
  end if;

  return new;
end;
$$;

create trigger advance_asset_last_service_date_after_write
after insert or update of property_id, asset_system_id, completed_date
on public.work_records
for each row execute function public.advance_asset_last_service_date();

create trigger set_work_records_updated_at
before update on public.work_records
for each row execute function public.set_updated_at();

alter table public.work_records enable row level security;

create policy "Users can read work records for their own properties"
on public.work_records for select
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = work_records.property_id
      and properties.user_id = (select auth.uid())
  )
);
create policy "Users can create work records for their own properties"
on public.work_records for insert
to authenticated
with check (
  exists (
    select 1
    from public.properties
    where properties.id = work_records.property_id
      and properties.user_id = (select auth.uid())
  )
);

create policy "Users can update work records for their own properties"
on public.work_records for update
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = work_records.property_id
      and properties.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.properties
    where properties.id = work_records.property_id
      and properties.user_id = (select auth.uid())
  )
);

create policy "Users can delete work records for their own properties"
on public.work_records for delete
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = work_records.property_id
      and properties.user_id = (select auth.uid())
  )
);
