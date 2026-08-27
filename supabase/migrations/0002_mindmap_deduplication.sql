-- =========================================================
-- BioLayers AI — Mind Map Deduplication
-- Adds content-addressable storage for mind maps to save space
-- when multiple users analyze the same paper.
-- =========================================================

-- ---------------------------------------------------------
-- 1. MINDMAPS TABLE (deduplicated storage)
-- Stores unique mind maps by content hash.
-- Multiple papers can reference the same mind map.
-- ---------------------------------------------------------

create table if not exists public.mindmaps (
  id uuid primary key default gen_random_uuid(),
  -- SHA-256 hash of the normalized mind map JSON (content-addressable)
  content_hash char(64) not null unique,
  -- The actual mind map data
  mindmap jsonb not null,
  -- Metadata about the mind map
  node_count integer not null default 0,
  link_count integer not null default 0,
  -- Reference count: how many papers point to this mind map
  reference_count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mindmaps_content_hash_idx on public.mindmaps (content_hash);
create index if not exists mindmaps_reference_count_idx on public.mindmaps (reference_count);

drop trigger if exists set_mindmaps_updated_at on public.mindmaps;
create trigger set_mindmaps_updated_at
  before update on public.mindmaps
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 2. PAPERS TABLE CHANGES
-- Add mindmap_id foreign key and content_hash for deduplication
-- ---------------------------------------------------------

alter table public.papers
  add column if not exists mindmap_id uuid references public.mindmaps(id) on delete set null,
  add column if not exists content_hash char(64);

create index if not exists papers_mindmap_id_idx on public.papers (mindmap_id);
create index if not exists papers_content_hash_idx on public.papers (content_hash);

-- ---------------------------------------------------------
-- 3. HELPER FUNCTIONS
-- ---------------------------------------------------------

-- Generate content hash from mindmap JSON
create or replace function public.generate_mindmap_hash(mindmap_json jsonb)
returns char(64)
language sql
immutable
as $$
  select encode(sha256(mindmap_json::text::bytea), 'hex');
$$;

-- Get or create a mindmap entry (atomic upsert for deduplication)
create or replace function public.get_or_create_mindmap(
  p_mindmap jsonb,
  p_node_count integer,
  p_link_count integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash char(64);
  v_mindmap_id uuid;
begin
  v_hash := public.generate_mindmap_hash(p_mindmap);
  
  -- Try to insert new mindmap, or update reference count if exists
  insert into public.mindmaps (content_hash, mindmap, node_count, link_count, reference_count)
  values (v_hash, p_mindmap, p_node_count, p_link_count, 1)
  on conflict (content_hash) do update set
    reference_count = mindmaps.reference_count + 1,
    updated_at = now()
  returning id into v_mindmap_id;
  
  return v_mindmap_id;
end;
$$;

-- Decrement reference count and cleanup unused mindmaps
create or replace function public.release_mindmap(p_mindmap_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.mindmaps
  set reference_count = reference_count - 1,
      updated_at = now()
  where id = p_mindmap_id
    and reference_count > 0;
  
  -- Clean up mindmaps with zero references (optional, run periodically)
  -- delete from public.mindmaps where reference_count = 0;
end;
$$;

-- Trigger to auto-decrement reference count when paper is deleted
create or replace function public.handle_paper_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.mindmap_id is not null then
    perform public.release_mindmap(old.mindmap_id);
  end if;
  return old;
end;
$$;

drop trigger if exists paper_delete_mindmap_release on public.papers;
create trigger paper_delete_mindmap_release
  before delete on public.papers
  for each row execute function public.handle_paper_delete();

-- ---------------------------------------------------------
-- 4. ROW LEVEL SECURITY FOR MINDMAPS
-- Mindmaps are globally readable (deduplicated content)
-- but only the system can insert/update reference counts
-- ---------------------------------------------------------

alter table public.mindmaps enable row level security;

drop policy if exists "Mindmaps are viewable by everyone" on public.mindmaps;
create policy "Mindmaps are viewable by everyone"
  on public.mindmaps for select
  using (true);

-- Only service role can insert/update mindmaps (via RPC functions)
-- No policies needed for insert/update - they use SECURITY DEFINER functions

-- ---------------------------------------------------------
-- 5. UPDATE EXISTING PAPERS (backfill)
-- This can be run manually after migration to populate mindmaps table
-- from existing papers with mindmap data.
-- ---------------------------------------------------------

/*
-- Run this after migration to backfill existing data:
insert into public.mindmaps (content_hash, mindmap, node_count, link_count, reference_count)
select 
  public.generate_mindmap_hash(mindmap) as content_hash,
  mindmap,
  jsonb_array_length(mindmap->'nodes') as node_count,
  jsonb_array_length(mindmap->'links') as link_count,
  count(*) as reference_count
from public.papers
where mindmap is not null
group by mindmap
on conflict (content_hash) do nothing;

-- Update papers with mindmap_id
update public.papers p
set mindmap_id = m.id
from public.mindmaps m
where p.mindmap is not null
  and public.generate_mindmap_hash(p.mindmap) = m.content_hash
  and p.mindmap_id is null;
*/