-- =========================================================
-- BioLayers AI — Database linter fixes
-- Resolves the Supabase database linter findings:
--   1. RLS initplan: evaluate auth.uid() once per query
--      instead of once per row (10 policies).
--   2. Replace the unused standalone papers.created_at index
--      with the composite (user_id, created_at desc) index
--      that matches the app's paper listing query.
--   3. Pin set_updated_at to a fixed search_path.
--   4. Remove SECURITY DEFINER functions from the public
--      PostgREST surface (they are no longer callable via
--      the anon/authenticated roles).
-- =========================================================

-- ---------------------------------------------------------
-- 1. RLS POLICIES — initplan optimization
-- (select auth.uid()) is a scalar subquery: Postgres computes
-- the current user id once per statement instead of calling
-- auth.uid() (a current_setting() lookup) for every row.
-- ---------------------------------------------------------

-- PROFILES -------------------------------------------------

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "Profiles can be inserted by owner" on public.profiles;
create policy "Profiles can be inserted by owner"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

drop policy if exists "Profiles can be updated by owner" on public.profiles;
create policy "Profiles can be updated by owner"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- USER AI SETTINGS -----------------------------------------

drop policy if exists "Users can view own AI settings" on public.user_ai_settings;
create policy "Users can view own AI settings"
  on public.user_ai_settings for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own AI settings" on public.user_ai_settings;
create policy "Users can insert own AI settings"
  on public.user_ai_settings for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own AI settings" on public.user_ai_settings;
create policy "Users can update own AI settings"
  on public.user_ai_settings for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own AI settings" on public.user_ai_settings;
create policy "Users can delete own AI settings"
  on public.user_ai_settings for delete
  using ((select auth.uid()) = user_id);

-- PAPERS ---------------------------------------------

drop policy if exists "Users can view own papers" on public.papers;
create policy "Users can view own papers"
  on public.papers for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own papers" on public.papers;
create policy "Users can insert own papers"
  on public.papers for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own papers" on public.papers;
create policy "Users can delete own papers"
  on public.papers for delete
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------
-- 2. PAPERS INDEX
-- The standalone created_at index is never used: the app
-- always filters by user_id first. Replace it with the
-- composite (user_id, created_at desc) index that matches
-- listPapers (select where user_id = ? order by created_at
-- desc).
-- ---------------------------------------------------------

drop index if exists public.papers_created_at_idx;
create index if not exists papers_user_created_idx
  on public.papers (user_id, created_at desc);

-- ---------------------------------------------------------
-- 3. SET_UPDATED_AT — fixed search_path
-- security-invoker trigger function: pin search_path so the
-- resolution of now()/updated_at cannot be hijacked by a
-- caller-controlled search_path.
-- ---------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------
-- 4. REMOVE SECURITY DEFINER FUNCTIONS FROM POSTGREST
-- handle_new_user is trigger-only; it never needs to be
-- executed by anon/authenticated. Triggers fire regardless of
-- EXECUTE grants, so revoking does not break signup.
-- get_platform_stats is now served through the server-side
-- /api/platform-stats route (service-role key) instead of the
-- public anon-key RPC surface.
-- ---------------------------------------------------------

revoke all on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;

revoke all on function public.get_platform_stats() from public;
revoke execute on function public.get_platform_stats() from anon, authenticated;