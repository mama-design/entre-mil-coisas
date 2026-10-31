-- Application and expense records are separate to avoid counting a purchase twice.
create table public.emc_medication_logs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('application','expense')),
 date date not null check(date<=((current_timestamp at time zone 'America/Sao_Paulo')::date)),
 time text not null default '' check(time='' or time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 medication text not null check(length(trim(medication)) between 1 and 120),
 dose text not null default '' check(length(dose)<=80),
 amount numeric(12,2) not null default 0 check(amount>=0 and amount<=1000000),
 notes text not null default '' check(length(notes)<=1000),
 updated_at timestamptz not null default now(),
 check(kind='expense' or amount=0)
);
create index emc_medication_user_date on public.emc_medication_logs(user_id,date);
alter table public.emc_medication_logs enable row level security;
create policy emc_medication_owner on public.emc_medication_logs for all to authenticated
 using ((select auth.uid())=user_id and exists(select 1 from public.emc_access where user_id=(select auth.uid())))
 with check ((select auth.uid())=user_id and exists(select 1 from public.emc_access where user_id=(select auth.uid())));
revoke all on public.emc_medication_logs from anon,authenticated;
grant select,insert,update,delete on public.emc_medication_logs to authenticated;
