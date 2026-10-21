-- =====================================================================
-- Hábitos & Metas — schema Supabase (rodar no SQL Editor)
-- =====================================================================

-- ---------- TABELAS ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create table public.habits (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title          text not null check (char_length(trim(title)) between 1 and 80),
  description    text,
  frequency      text not null default 'daily' check (frequency in ('daily', 'weekly')),
  weekly_target  smallint not null default 1 check (weekly_target between 1 and 7),
  reminder_time  time,                                   -- horário opcional (HH:MM)
  archived       boolean not null default false,
  created_at     timestamptz not null default now()
);
create index habits_user_idx on public.habits (user_id);

create table public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  habit_id    uuid not null references public.habits(id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date    date not null default current_date,
  created_at  timestamptz not null default now(),
  unique (habit_id, log_date)
);
create index habit_logs_user_date_idx on public.habit_logs (user_id, log_date desc);

create table public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title          text not null check (char_length(trim(title)) between 1 and 80),
  description    text,
  unit           text,                                   -- ex.: "R$", "km"
  target_value   numeric not null check (target_value > 0),
  current_value  numeric not null default 0 check (current_value >= 0),
  deadline       date,
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);
create index goals_user_idx on public.goals (user_id);

-- ---------- RLS ----------
alter table public.profiles   enable row level security;
alter table public.habits     enable row level security;
alter table public.habit_logs enable row level security;
alter table public.goals      enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- habits
create policy "habits_select_own" on public.habits
  for select to authenticated using (user_id = (select auth.uid()));
create policy "habits_insert_own" on public.habits
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "habits_update_own" on public.habits
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "habits_delete_own" on public.habits
  for delete to authenticated using (user_id = (select auth.uid()));

-- habit_logs (o hábito referenciado também precisa ser do usuário)
create policy "logs_select_own" on public.habit_logs
  for select to authenticated using (user_id = (select auth.uid()));
create policy "logs_insert_own" on public.habit_logs
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid()))
  );
create policy "logs_delete_own" on public.habit_logs
  for delete to authenticated using (user_id = (select auth.uid()));

-- goals
create policy "goals_select_own" on public.goals
  for select to authenticated using (user_id = (select auth.uid()));
create policy "goals_insert_own" on public.goals
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "goals_update_own" on public.goals
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "goals_delete_own" on public.goals
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------- TRIGGER: cria o perfil ao cadastrar ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
