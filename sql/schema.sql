-- Entre mil coisas: storage isolated from all Manager tables.
create table public.emc_access (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.emc_access enable row level security;
create policy emc_access_self on public.emc_access for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.emc_access from anon, authenticated;
grant select on public.emc_access to authenticated;
create table public.emc_notebooks (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null default '{"entries":[],"completions":[],"habits":[],"logs":[],"categories":[],"routineSetup":false}',
 revision bigint not null default 0,
 updated_at timestamptz not null default now(),
 constraint emc_state_shape check (jsonb_typeof(state->'entries')='array' and jsonb_typeof(state->'categories')='array' and jsonb_typeof(state->'habits')='array' and jsonb_typeof(state->'logs')='array' and jsonb_typeof(state->'completions')='array')
);
alter table public.emc_notebooks enable row level security;
create policy emc_notebook_owner on public.emc_notebooks for all to authenticated
 using ((select auth.uid())=user_id and exists(select 1 from public.emc_access a where a.user_id=(select auth.uid())))
 with check ((select auth.uid())=user_id and exists(select 1 from public.emc_access a where a.user_id=(select auth.uid())));
revoke all on public.emc_notebooks from anon,authenticated;
grant select,insert,update on public.emc_notebooks to authenticated;

-- Every mutation locks the document, so saves on two devices preserve other items.
create or replace function public.emc_mutate(collection text, verb text, payload jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s jsonb; rowdata jsonb; old jsonb; result jsonb; identifier text; d text; nm text; oldnm text;
 today text:=to_char(current_timestamp at time zone 'America/Sao_Paulo','YYYY-MM-DD');
 idx integer; ids jsonb; planned boolean;
begin
 if auth.uid() is null or not exists(select 1 from public.emc_access where user_id=auth.uid()) then raise exception 'Este espaço é pessoal. Entre com a conta autorizada.' using errcode='42501'; end if;
 select state into s from public.emc_notebooks where user_id=auth.uid() for update;
 if s is null then raise exception 'Caderninho não configurado.'; end if;
 identifier:=coalesce(nullif(payload->>'id',''),gen_random_uuid()::text);
 if collection='entries' then
  if verb='POST' and payload->>'setupMariana'='true' then
   if not coalesce((s->>'routineSetup')::boolean,false) then
    for rowdata in select value from jsonb_array_elements(jsonb_build_array(
      jsonb_build_object('title','Mariana · educação física','repeatDays','2'),
      jsonb_build_object('title','Mariana · troca de livro','repeatDays','4'),
      jsonb_build_object('title','Mariana · canto / culto','repeatDays','5'))) loop
     s:=jsonb_set(s,'{entries}',(s->'entries')||jsonb_build_array(rowdata||jsonb_build_object('id',gen_random_uuid()::text,'date',today,'time','','category','Mariana','notes','','reminder',1,'done',0)));
    end loop;
    s:=jsonb_set(s,'{routineSetup}','true');
   end if;
   result:='{"ok":true}';
  elsif verb='POST' then
   if length(trim(coalesce(payload->>'title','')))=0 or length(payload->>'title')>200 then raise exception 'Confira o título.'; end if;
   d:=coalesce(payload->>'date','');
   if d<>'' then perform d::date; end if;
   if d='' and (coalesce(payload->>'time','')<>'' or coalesce(payload->>'repeatDays','')<>'') then raise exception 'Tarefa sem data não pode ter horário ou repetição.'; end if;
   if coalesce(payload->>'time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$|^$' or coalesce(payload->>'repeatDays','') !~ '^([0-6](,[0-6])*)?$' then raise exception 'Confira horário e repetição.'; end if;
   if coalesce(payload->>'category','')<>'' and not exists(select 1 from jsonb_array_elements(s->'categories') c where c->>'name'=payload->>'category') then raise exception 'Escolha uma categoria disponível.'; end if;
   if (payload->>'reminder')::integer not in (-1,0,1,2,3,7,14) or (payload->>'done')::integer not in (0,1) then raise exception 'Confira lembrete e conclusão.'; end if;
   rowdata:=jsonb_build_object('id',identifier,'title',trim(payload->>'title'),'date',d,'time',coalesce(payload->>'time',''),'category',coalesce(payload->>'category',''),'notes',left(coalesce(payload->>'notes',''),5000),'reminder',(payload->>'reminder')::integer,'repeatDays',coalesce(payload->>'repeatDays',''),'done',(payload->>'done')::integer);
   s:=jsonb_set(s,'{entries}',coalesce((select jsonb_agg(v) from jsonb_array_elements(s->'entries') v where v->>'id'<>identifier),'[]')||jsonb_build_array(rowdata));result:=rowdata;
  elsif verb='DELETE' then
   s:=jsonb_set(s,'{entries}',coalesce((select jsonb_agg(v) from jsonb_array_elements(s->'entries') v where v->>'id'<>identifier),'[]'));
   s:=jsonb_set(s,'{completions}',coalesce((select jsonb_agg(v) from jsonb_array_elements(s->'completions') v where v->>'entryId'<>identifier),'[]')); result:='{"ok":true}';
  elsif verb='PATCH' then
   d:=payload->>'date';perform d::date;
   select v into old from jsonb_array_elements(s->'entries') v where v->>'id'=identifier;
   if old is null or d<old->>'date' or not (extract(dow from d::date)::text=any(string_to_array(old->>'repeatDays',','))) then raise exception 'Dia não previsto nesta rotina.'; end if;
   s:=jsonb_set(s,'{completions}',coalesce((select jsonb_agg(v) from jsonb_array_elements(s->'completions') v where not (v->>'entryId'=identifier and v->>'date'=d)),'[]'));
   if (payload->>'done')::boolean then s:=jsonb_set(s,'{completions}',s->'completions'||jsonb_build_array(jsonb_build_object('entryId',identifier,'date',d))); end if;result:='{"ok":true}';
  else raise exception 'Operação inválida.'; end if;
 elsif collection='habits' then
  if verb='POST' then
   if length(trim(coalesce(payload->>'title','')))=0 or length(payload->>'title')>100 or coalesce(payload->>'days','') !~ '^[0-6](,[0-6])*$' then raise exception 'Confira nome e dias do hábito.'; end if;
   perform (payload->>'startDate')::date;
   if payload->>'color' not in ('sage','lilac','blue','peach','yellow') or (payload->>'archived')::integer not in (0,1) then raise exception 'Confira a cor do hábito.'; end if;
   rowdata:=jsonb_build_object('id',identifier,'title',trim(payload->>'title'),'startDate',payload->>'startDate','days',payload->>'days','icon',left(coalesce(payload->>'icon','none'),30),'color',payload->>'color','notes',left(coalesce(payload->>'notes',''),1000),'archived',(payload->>'archived')::integer);
   s:=jsonb_set(s,'{habits}',coalesce((select jsonb_agg(v) from jsonb_array_elements(s->'habits') v where v->>'id'<>identifier),'[]')||jsonb_build_array(rowdata));result:=rowdata;
  elsif verb='PATCH' then
   d:=payload->>'date';perform d::date;
   select v into old from jsonb_array_elements(s->'habits') v where v->>'id'=identifier;
   if old is null or old->>'archived'='1' or d<old->>'startDate' or d>today or not (extract(dow from d::date)::text=any(string_to_array(old->>'days',','))) then raise exception 'Escolha um dia previsto, até hoje.'; end if;
   s:=jsonb_set(s,'{logs}',coalesce((select jsonb_agg(v) from jsonb_array_elements(s->'logs') v where not (v->>'habitId'=identifier and v->>'date'=d)),'[]'));
   if (payload->>'done')::boolean then s:=jsonb_set(s,'{logs}',s->'logs'||jsonb_build_array(jsonb_build_object('habitId',identifier,'date',d))); end if; result:='{"ok":true}';
  else raise exception 'Operação inválida.'; end if;
 elsif collection='categories' then
  select v into old from jsonb_array_elements(s->'categories') v where v->>'id'=identifier;
  if verb='POST' then
   nm:=trim(payload->>'name');
   if coalesce(nm,'')='' or length(nm)>60 or coalesce(payload->>'color','') !~ '^#[0-9a-fA-F]{6}$' then raise exception 'Confira nome e cor da categoria.'; end if;
   if exists(select 1 from jsonb_array_elements(s->'categories') v where lower(v->>'name')=lower(nm) and v->>'id'<>identifier) then raise exception 'Já existe uma categoria com esse nome.'; end if;
   rowdata:=jsonb_build_object('id',identifier,'name',nm,'color',payload->>'color','icon',left(coalesce(payload->>'icon','none'),30),'position',(payload->>'position')::integer);
   s:=jsonb_set(s,'{categories}',coalesce((select jsonb_agg(v) from jsonb_array_elements(s->'categories') v where v->>'id'<>identifier),'[]')||jsonb_build_array(rowdata));
   if old is not null then s:=jsonb_set(s,'{entries}',coalesce((select jsonb_agg(case when v->>'category'=old->>'name' then jsonb_set(v,'{category}',to_jsonb(nm)) else v end) from jsonb_array_elements(s->'entries') v),'[]')); end if;result:=rowdata;
  elsif verb='DELETE' then
   if old is null then raise exception 'Categoria não encontrada.'; end if;
   s:=jsonb_set(s,'{categories}',coalesce((select jsonb_agg(v) from jsonb_array_elements(s->'categories') v where v->>'id'<>identifier),'[]'));
   s:=jsonb_set(s,'{entries}',coalesce((select jsonb_agg(case when v->>'category'=old->>'name' then jsonb_set(v,'{category}','""') else v end) from jsonb_array_elements(s->'entries') v),'[]'));result:='{"ok":true}';
  elsif verb='PATCH' then
   ids:=payload->'ids';
   if jsonb_typeof(ids)<>'array' or jsonb_array_length(ids)<>jsonb_array_length(s->'categories') or (select count(distinct v) from jsonb_array_elements_text(ids) v)<>jsonb_array_length(ids) or exists(select 1 from jsonb_array_elements_text(ids) i where not exists(select 1 from jsonb_array_elements(s->'categories') c where c->>'id'=i)) then raise exception 'Ordem inválida.'; end if;
   s:=jsonb_set(s,'{categories}',coalesce((select jsonb_agg(jsonb_set(c,'{position}',to_jsonb((i.ordinality-1)::integer)) order by i.ordinality) from jsonb_array_elements_text(ids) with ordinality i(value,ordinality) join jsonb_array_elements(s->'categories') c on c->>'id'=i.value),'[]'));result:='{"ok":true}';
  else raise exception 'Operação inválida.'; end if;
 else raise exception 'Coleção inválida.'; end if;
 update public.emc_notebooks set state=s, revision=revision+1, updated_at=now() where user_id=auth.uid();
 return result;
end $$;
revoke all on function public.emc_mutate(text,text,jsonb) from public,anon;
grant execute on function public.emc_mutate(text,text,jsonb) to authenticated;
