-- Publishing: allow users to make mind maps publicly viewable
-- Adds is_public flag, published_at timestamp, and unique share_token

ALTER TABLE public.papers
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS published_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS share_token text DEFAULT encode(gen_random_bytes(12), 'hex');

-- Unique index on share_token for fast public lookups
CREATE UNIQUE INDEX IF NOT EXISTS papers_share_token_idx
  ON public.papers (share_token)
  WHERE share_token IS NOT NULL;

-- Partial index for listing published papers
CREATE INDEX IF NOT EXISTS papers_public_idx
  ON public.papers (published_at DESC)
  WHERE is_public = true;

-- Allow anyone (anon + authenticated) to read published papers
DROP POLICY IF EXISTS "Anyone can view published papers" ON public.papers;
CREATE POLICY "Anyone can view published papers"
  ON public.papers FOR SELECT
  USING (is_public = true);

-- Allow owners to update their own papers (to toggle is_public)
DROP POLICY IF EXISTS "Users can update own papers" ON public.papers;
CREATE POLICY "Users can update own papers"
  ON public.papers FOR UPDATE
  USING ((select auth.uid()) = user_id);
