-- Allow public read access to profiles for library display
-- Using a security definer function to bypass RLS for safe fields only

CREATE OR REPLACE FUNCTION public.get_public_profile(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, full_name, avatar_url
  FROM public.profiles
  WHERE id = p_user_id AND username IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;

-- For batch fetching in library
CREATE OR REPLACE FUNCTION public.get_public_profiles(p_user_ids uuid[])
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, full_name, avatar_url
  FROM public.profiles
  WHERE id = ANY(p_user_ids) AND username IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO anon, authenticated;