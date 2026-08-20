-- =========================================================
-- BioLayers AI — Platform-wide public stats
-- Exposes aggregate counts to the marketing/home page.
--
-- RLS restricts profiles/papers to their owners, so this
-- security-definer function is the only way anonymous
-- visitors can read platform-wide totals. Only the function
-- is granted; callers get no direct table access.
-- =========================================================

create or replace function public.get_platform_stats()
returns table (
  users bigint,
  papers bigint,
  entities bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*)::bigint from public.profiles),
    (select count(*)::bigint from public.papers),
    (select coalesce(sum(jsonb_array_length(mindmap -> 'nodes')), 0)::bigint
     from public.papers
     where mindmap is not null);
$$;

revoke all on function public.get_platform_stats() from public;
grant execute on function public.get_platform_stats() to anon, authenticated;