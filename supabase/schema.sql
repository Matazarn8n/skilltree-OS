-- SkillTree-OS — schéma state-user (Postgres/Supabase). Conforme docs/ARCHITECTURE.md §5.
-- REMPLACE l'ancien schéma prototype (sectors/skills/skill_edges — supprimés, D4 : le catalogue
-- reste des fichiers buildés, jamais en DB). RLS par-user (D5) sur les 6 tables.
-- Idempotent : rejouable via `supabase db reset` ou `psql -f`.

-- ── Reset (idempotent) : drop tables AVANT les types — sinon `drop type cascade`
-- retire les colonnes enum des tables existantes que `create table if not exists` ne
-- recrée pas (colonnes fantômes). On repart propre à chaque application.
drop table if exists onboarding cascade;
drop table if exists tree_state cascade;
drop table if exists brain cascade;
drop table if exists installs cascade;
drop table if exists progress cascade;
drop table if exists users cascade;

-- ── Enums ────────────────────────────────────────────────────────────────────
drop type if exists lesson_status cascade;
drop type if exists brain_section cascade;
drop type if exists brain_source cascade;
drop type if exists job_level cascade;
drop type if exists onboarding_path cascade;

create type lesson_status   as enum ('locked','in_progress','done');
create type brain_section   as enum ('company','offer','customers','voice','ops','stack','goals','constraints');
create type brain_source    as enum ('ai','manual');
create type job_level       as enum ('none','manual','assisted','autonomous');
create type onboarding_path as enum ('agency','business','company','exploring');

-- ── Tables ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id         uuid primary key references auth.users on delete cascade,
  email      text not null,
  paid       bool not null default false,
  plan       text not null default 'member',
  created_at timestamptz not null default now()
);

create table if not exists progress (
  user_id      uuid not null references users(id) on delete cascade,
  lesson_id    text not null,                       -- 'start-here/welcome' … (18, validés vs catalogue au build)
  status       lesson_status not null default 'in_progress',
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create table if not exists installs (
  user_id      uuid not null references users(id) on delete cascade,
  skill_slug   text not null,                       -- 78 slugs catalogue
  installed_at timestamptz not null default now(),
  primary key (user_id, skill_slug)
);

create table if not exists brain (
  user_id    uuid not null references users(id) on delete cascade,
  section    brain_section not null,
  content    text not null default '',
  source     brain_source not null default 'manual',
  updated_at timestamptz not null default now(),
  primary key (user_id, section)
);

create table if not exists tree_state (
  user_id    uuid not null references users(id) on delete cascade,
  job_id     text not null,                         -- slug D9
  level      job_level not null default 'none',
  updated_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create table if not exists onboarding (
  user_id uuid primary key references users(id) on delete cascade,
  path    onboarding_path,
  step    int not null default 0,                   -- 0..6
  done    bool not null default false
);

-- ── Signup trigger : crée la ligne users dès l'inscription auth ──────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── RLS (D5) : chaque user ne voit QUE ses lignes ────────────────────────────
alter table users      enable row level security;
alter table progress   enable row level security;
alter table installs   enable row level security;
alter table brain      enable row level security;
alter table tree_state enable row level security;
alter table onboarding enable row level security;

-- users : keyée par id
drop policy if exists users_select on users;
drop policy if exists users_insert on users;
drop policy if exists users_update on users;
create policy users_select on users for select using (id = auth.uid());
create policy users_insert on users for insert with check (id = auth.uid());
create policy users_update on users for update using (id = auth.uid()) with check (id = auth.uid());

-- progress / installs / brain / tree_state / onboarding : keyées par user_id
do $$
declare t text;
begin
  foreach t in array array['progress','installs','brain','tree_state','onboarding'] loop
    execute format('drop policy if exists %I_all on %I', t, t);
    execute format(
      'create policy %I_all on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t, t);
  end loop;
end $$;

-- ── Grants : RLS gate la VISIBILITÉ des lignes, les GRANT donnent l'ACCÈS table.
-- Les deux sont requis (Supabase). `authenticated` = user connecté (JWT) ; l'isolation
-- reste assurée par les policies (auth.uid()). `anon` n'a AUCUN grant sur les tables user.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
-- futures tables : mêmes grants par défaut
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated, service_role;

-- PostgREST : recharge son cache de schéma après ce DDL (sinon PGRST204 colonnes fantômes)
notify pgrst, 'reload schema';
