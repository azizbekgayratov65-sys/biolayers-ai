-- Backfill: mark all existing papers as published
-- Run this after migration 0004_publishing.sql

UPDATE public.papers
SET 
  is_public = true,
  published_at = COALESCE(published_at, created_at),
  share_token = COALESCE(share_token, encode(gen_random_bytes(12), 'hex'))
WHERE is_public IS NOT TRUE;

-- Verify
SELECT 
  count(*) as total_papers,
  count(*) filter (where is_public = true) as public_papers,
  count(*) filter (where is_public = false) as private_papers
FROM public.papers;