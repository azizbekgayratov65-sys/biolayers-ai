-- =========================================================
-- BioLayers SI — Security hardening
--
-- 1. The mind map dedup functions from 0002 are SECURITY
--    DEFINER and were executable by PUBLIC, so anyone holding
--    the public anon key could call them over PostgREST:
--      - release_mindmap(any id) decremented reference counts
--        on mind maps they do not own;
--      - get_or_create_mindmap let anonymous callers write
--        arbitrary JSON into public.mindmaps.
--    get_or_create_mindmap stays available to signed-in users
--    (the app calls it when saving). release_mindmap and the
--    delete trigger function are internal only.
--
-- 2. public.mindmaps was readable by everyone, so the content
--    of private (unpublished) papers leaked through it. A mind
--    map is now visible only when the caller can see at least
--    one paper that references it (papers RLS applies inside
--    the policy subquery).
-- =========================================================

revoke all on function public.get_or_create_mindmap(jsonb, integer, integer) from public, anon;
grant execute on function public.get_or_create_mindmap(jsonb, integer, integer) to authenticated;

revoke all on function public.release_mindmap(uuid) from public, anon, authenticated;
revoke all on function public.handle_paper_delete() from public, anon, authenticated;

drop policy if exists "Mindmaps are viewable by everyone" on public.mindmaps;
drop policy if exists "Mindmaps are viewable with a visible paper" on public.mindmaps;
create policy "Mindmaps are viewable with a visible paper"
  on public.mindmaps for select
  using (
    exists (
      select 1
      from public.papers p
      where p.mindmap_id = mindmaps.id
    )
  );
