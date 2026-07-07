-- SkillTree-OS — schéma Postgres (cible Supabase). Voir docs/00_master_plan.md §2.
-- Principe : entités relationnelles + arêtes explicites (pas de JSON d'arbre monolithique).
-- RLS dès le départ -> multi-tenant natif (produit visé revendable).

-- ── Catalogue (public en lecture, écriture admin) ───────────────────────────
create table if not exists sectors (
  slug         text primary key,
  name         text not null,
  tagline      text not null,
  color_var    text not null,
  order_index  int  not null default 0
);

create type skill_status as enum ('live','drop','soon');
create type skill_stage  as enum ('foundation','capture','generate','orchestrate');

create table if not exists skills (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  sector_slug   text not null references sectors(slug),
  summary       text not null,
  autonomy      bool not null default true,
  status        skill_status not null default 'live',
  stage         skill_stage  not null default 'foundation',
  icon          text not null default 'skill',
  install_count int  not null default 0,
  published_at  timestamptz not null default now()
);
create index if not exists skills_sector_idx on skills(sector_slug);
create index if not exists skills_status_idx on skills(status, published_at desc);

-- arêtes du graphe (prérequis) : droper un skill = 1 insert, jamais réécrire un arbre
create table if not exists skill_edges (
  from_skill uuid not null references skills(id) on delete cascade,
  to_skill   uuid not null references skills(id) on delete cascade,
  kind       text not null default 'requires',
  primary key (from_skill, to_skill)
);

create table if not exists build_guides (
  skill_id uuid primary key references skills(id) on delete cascade,
  steps    jsonb not null default '[]'   -- [{title, body, code}]  (sans schéma -> jsonb ok)
);
create table if not exists command_centers (
  skill_id uuid primary key references skills(id) on delete cascade,
  title    text not null,
  metrics  jsonb not null default '[]'   -- [{label, value}]
);

-- ── Contenu pédagogique ─────────────────────────────────────────────────────
create table if not exists modules (
  slug text primary key, title text not null, subtitle text not null, order_index int not null default 0
);
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_slug text not null references modules(slug),
  slug text not null, title text not null, order_index int not null, est_min int not null default 5,
  mdx_ref text not null,                 -- corps versionné en repo (content/lessons/…)
  unique (module_slug, slug)
);

-- ── Utilisateur & état (RLS scopé auth.uid()) ───────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, plan text not null default 'member', persona text, created_at timestamptz default now()
);
create table if not exists user_skills (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  installed_at timestamptz default now(),
  primary key (user_id, skill_id)
);
create table if not exists user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  primary key (user_id, lesson_id)
);
create table if not exists brains (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sections jsonb not null default '{}',  -- 8 sections
  source_url text, drafted_by text, updated_at timestamptz default now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table profiles       enable row level security;
alter table user_skills    enable row level security;
alter table user_progress  enable row level security;
alter table brains         enable row level security;

create policy "own profile"  on profiles      for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own skills"   on user_skills   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress" on user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own brain"    on brains        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- catalogue & contenu : lecture publique
alter table sectors enable row level security;
alter table skills  enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
create policy "read sectors" on sectors for select using (true);
create policy "read skills"  on skills  for select using (true);
create policy "read modules" on modules for select using (true);
create policy "read lessons" on lessons for select using (true);

-- Le jour SaaS multi-org : ajouter org_id aux tables user_* + policy sur org membership. Pas avant.
