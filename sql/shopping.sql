create table public.emc_shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 120),
  quantity text not null default '' check (length(quantity) <= 60),
  purchased boolean not null default false,
  created_at timestamptz not null default now()
);

create index emc_shopping_items_owner_order on public.emc_shopping_items(user_id, created_at);
alter table public.emc_shopping_items enable row level security;
create policy emc_shopping_items_owner on public.emc_shopping_items
  for all to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.emc_access where user_id = (select auth.uid())
  ))
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.emc_access where user_id = (select auth.uid())
  ));
revoke all on public.emc_shopping_items from public, anon, authenticated;
grant select, insert, update, delete on public.emc_shopping_items to authenticated;
