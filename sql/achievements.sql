-- Private achievements. Personal dates, settings and weights are never stored in Git.
create table public.emc_achievement_settings (
 user_id uuid primary key references auth.users(id) on delete cascade,
 smoke_started_at timestamptz not null,
 pack_price numeric(10,2) not null check(pack_price>=0 and pack_price<=10000),
 packs_per_day numeric(8,3) not null check(packs_per_day>0 and packs_per_day<=100),
 goal_weight numeric(5,2) check(goal_weight>0 and goal_weight<=500),
 updated_at timestamptz not null default now()
);
create table public.emc_weight_logs (
 user_id uuid not null references auth.users(id) on delete cascade,
 date date not null check(date<=((current_timestamp at time zone 'America/Sao_Paulo')::date)),
 weight numeric(5,2) not null check(weight>0 and weight<=500),
 notes text not null default '' check(length(notes)<=1000),
 updated_at timestamptz not null default now(),
 primary key(user_id,date)
);
alter table public.emc_achievement_settings enable row level security;
alter table public.emc_weight_logs enable row level security;
create policy emc_achievement_owner on public.emc_achievement_settings for all to authenticated
 using ((select auth.uid())=user_id and exists(select 1 from public.emc_access where user_id=(select auth.uid())))
 with check ((select auth.uid())=user_id and exists(select 1 from public.emc_access where user_id=(select auth.uid())));
create policy emc_weight_owner on public.emc_weight_logs for all to authenticated
 using ((select auth.uid())=user_id and exists(select 1 from public.emc_access where user_id=(select auth.uid())))
 with check ((select auth.uid())=user_id and exists(select 1 from public.emc_access where user_id=(select auth.uid())));
revoke all on public.emc_achievement_settings,public.emc_weight_logs from anon,authenticated;
grant select,update on public.emc_achievement_settings to authenticated;
grant select,insert,update,delete on public.emc_weight_logs to authenticated;
