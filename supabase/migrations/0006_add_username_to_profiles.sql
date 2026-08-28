-- Add username column to profiles table
-- Derived from email prefix (before @) for existing users, with uniqueness handling

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

-- Backfill username from email prefix for existing profiles
-- Handle conflicts by appending a number suffix
DO $$
DECLARE
  prof RECORD;
  base_username text;
  counter int;
  candidate_username text;
BEGIN
  FOR prof IN
    SELECT id, email FROM public.profiles WHERE username IS NULL
  LOOP
    base_username := split_part(prof.email, '@', 1);
    candidate_username := base_username;
    counter := 1;

    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate_username) LOOP
      counter := counter + 1;
      candidate_username := base_username || counter;
    END LOOP;

    UPDATE public.profiles SET username = candidate_username WHERE id = prof.id;
  END LOOP;
END $$;

-- Ensure uniqueness (emails are unique in auth.users, so prefixes may conflict)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx
  ON public.profiles (username)
  WHERE username IS NOT NULL;

-- Update handle_new_user trigger to also set username
-- Username must be unique, so we try base and append numbers if needed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  candidate_username text;
  counter int;
BEGIN
  base_username := SPLIT_PART(COALESCE(NEW.email, ''), '@', 1);
  candidate_username := base_username;
  counter := 1;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate_username) LOOP
    counter := counter + 1;
    candidate_username := base_username || counter;
  END LOOP;

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
    candidate_username
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;