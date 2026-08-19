-- =========================================================
-- BioLayers AI — Initial schema
-- Authentication: Supabase Auth (auth.users is managed by Supabase)
-- =========================================================

-- ---------------------------------------------------------
-- 1. PROFILES
-- One row per authenticated user. Created automatically by a
-- trigger on auth.users so every signup gets a profile.
-- ---------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'user_name',
      null
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 2. USER AI SETTINGS
-- Stores the user's own AI provider credentials. Only the
-- ciphertext of the Gemini API key is stored here; the raw
-- key is never persisted in plaintext.
-- ---------------------------------------------------------

create table if not exists public.user_ai_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  -- Extensible: future providers ("openai", "groq", ...) can be added.
  provider text not null default 'gemini' check (provider in ('gemini')),
  -- AES-256-GCM payload: v1:<iv b64>:<authTag b64>:<ciphertext b64>
  encrypted_api_key text,
  -- Non-secret display helper: last 4 characters of the stored key.
  key_masked text,
  key_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_user_ai_settings_updated_at on public.user_ai_settings;
create trigger set_user_ai_settings_updated_at
  before update on public.user_ai_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 3. PAPERS
-- User-owned summarization records. Ownership is enforced by
-- RLS and derived from the authenticated Supabase session.
-- ---------------------------------------------------------

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text,
  file_type text,
  title text,
  mindmap jsonb,
  character_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists papers_user_id_idx on public.papers (user_id);
create index if not exists papers_created_at_idx on public.papers (created_at desc);

drop trigger if exists set_papers_updated_at on public.papers;
create trigger set_papers_updated_at
  before update on public.papers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- Users can only access their own rows.
-- ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_ai_settings enable row level security;
alter table public.papers enable row level security;

-- PROFILES -------------------------------------------------

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles can be inserted by owner" on public.profiles;
create policy "Profiles can be inserted by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles can be updated by owner" on public.profiles;
create policy "Profiles can be updated by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- USER AI SETTINGS -----------------------------------------
-- Critical: no user may read or modify another user's row,
-- which would expose another user's Gemini API key.

drop policy if exists "Users can view own AI settings" on public.user_ai_settings;
create policy "Users can view own AI settings"
  on public.user_ai_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own AI settings" on public.user_ai_settings;
create policy "Users can insert own AI settings"
  on public.user_ai_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own AI settings" on public.user_ai_settings;
create policy "Users can update own AI settings"
  on public.user_ai_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own AI settings" on public.user_ai_settings;
create policy "Users can delete own AI settings"
  on public.user_ai_settings for delete
  using (auth.uid() = user_id);

-- PAPERS ---------------------------------------------

drop policy if exists "Users can view own papers" on public.papers;
create policy "Users can view own papers"
  on public.papers for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own papers" on public.papers;
create policy "Users can insert own papers"
  on public.papers for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own papers" on public.papers;
create policy "Users can delete own papers"
  on public.papers for delete
  using (auth.uid() = user_id);