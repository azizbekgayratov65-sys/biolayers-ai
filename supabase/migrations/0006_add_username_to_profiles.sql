-- Add username column to profiles table
-- Derived from email prefix (before @) for existing users

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

-- Backfill username from email prefix for existing profiles
UPDATE public.profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- Ensure uniqueness (emails are unique in auth.users, so prefixes may conflict - handle gracefully)
-- For now just create a unique index where username is not null
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx
  ON public.profiles (username)
  WHERE username IS NOT NULL;

-- Update handle_new_user trigger to also set username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'user_name',
      NULL
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL),
    SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;