-- ==========================================================
-- EduPath AI - Supabase Database Schema
-- Run this in your Supabase Project SQL Editor
-- (Project URL: https://ugnltqzfnsuqtomlpbvr.supabase.co)
-- ==========================================================

-- 1. Create user_profiles table
create table if not exists public.user_profiles (
  id text primary key,
  email text not null,
  name text,
  target_role text,
  experience_level text,
  preferences jsonb,
  active_roadmap jsonb,
  saved_courses jsonb,
  progress_tracker jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create index on email
create index if not exists idx_user_profiles_email on public.user_profiles (email);

-- 3. Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;

-- 4. Create open access policy for demo/client app
create policy "Allow all actions for authenticated and anon users"
  on public.user_profiles
  for all
  using (true)
  with check (true);
