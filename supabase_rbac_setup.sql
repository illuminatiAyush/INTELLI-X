-- This script sets up Role-Based Access Control (RBAC) in your Supabase project.
-- Run this script in the Supabase SQL Editor.

-- 1. Create a custom enum type for your user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- 2. Create a public 'profiles' table to store user data and roles
-- This links directly to the secure auth.users table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at timestamp with time zone,
  role public.app_role DEFAULT 'student'::public.app_role NOT NULL,
  first_name text,
  last_name text,
  avatar_url text
);

-- 3. Set up Row Level Security (RLS) on the profiles table
-- RLS ensures users can only access data they are allowed to see
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Create a function to handle new user signups
-- This will automatically insert a row into public.profiles
-- when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    new.id,
    -- Default role is student unless specified in metadata during signup
    COALESCE((new.raw_user_meta_data->>'role')::public.app_role, 'student'::public.app_role),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a trigger that calls the function every time a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Utility: A helper function to check the current user's role securely in other RLS policies
-- Usage example: CREATE POLICY "..." ON my_table FOR SELECT USING (public.get_my_role() = 'teacher');
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
