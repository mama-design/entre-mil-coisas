create table public.emc_birthdays (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 120),
 birth_month integer not null check(birth_month between 1 and 12),
 birth_day integer not null check(birth_day between 1 and 31),
 birth_year integer check(birth_year between 1900 and extract(year from current_date)::integer),
 relationship text not null default '' check(length(relationship)<=120),
 reminder integer not null default 0 check(reminder in (-1,0,1,2,3,7,14,30)),
 notes text not null default '' check(length(notes)<=2000),
 updated_at timestamptz not null default now(),
 check(birth_day<=extract(day from (make_date(2000,birth_month,1)+interval '1 month - 1 day'))),
 check(birth_year is null or make_date(birth_year,birth_month,birth_day)<=(current_timestamp at time zone 'America/Sao_Paulo')::date)
);
create index emc_birthday_owner on public.emc_birthdays(user_id);
alter table public.emc_birthdays enable row level security;
create policy emc_birthdays_owner on public.emc_birthdays for all to authenticated
 using ((select auth.uid())=user_id and exists(select 1 from public.emc_access where user_id=(select auth.uid())))
 with check ((select auth.uid())=user_id and exists(select 1 from public.emc_access where user_id=(select auth.uid())));
revoke all on public.emc_birthdays from anon,authenticated;
grant select,insert,update,delete on public.emc_birthdays to authenticated;
