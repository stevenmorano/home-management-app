-- Remove duplicate starter assets and prevent future duplicate checklist submissions.
-- Duplicates are defined per property by category + normalized name.

with ranked_asset_systems as (
  select
    id,
    row_number() over (
      partition by property_id, category, lower(trim(name))
      order by created_at asc, id asc
    ) as duplicate_rank
  from public.asset_systems
)
delete from public.asset_systems
using ranked_asset_systems
where asset_systems.id = ranked_asset_systems.id
  and ranked_asset_systems.duplicate_rank > 1;

create unique index if not exists asset_systems_property_category_name_unique_idx
on public.asset_systems (property_id, category, lower(trim(name)));
