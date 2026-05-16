-- Add password_hash column to users table for login without Supabase Auth.
-- Run this in Supabase Dashboard → SQL Editor → New query, then run it.

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS password_hash text;

COMMENT ON COLUMN public.users.password_hash IS 'bcrypt hash of user password; never expose in API responses.';
