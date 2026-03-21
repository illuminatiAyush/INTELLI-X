-- 1. Add master_admin to the app_role enum
-- We must do this outside a transaction block and handle if it already exists.
-- PostgreSQL requires a specific syntax to add enum values safely.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'master_admin') THEN
    ALTER TYPE public.app_role ADD VALUE 'master_admin';
  END IF;
END$$;

-- 2. Create the institutes table
CREATE TABLE IF NOT EXISTS public.institutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on institutes early
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

-- 3. Add institute_id to ALL operational tables
-- Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;
-- Teachers
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;
-- Students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;
-- Batches
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;
-- Attendance
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;
-- Tests
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;
-- Results
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;
-- Materials
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;

-- 4. Create performant helper functions for RLS (to prevent infinite recursion)
-- These use SECURITY DEFINER to bypass RLS when looking up rules
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'master_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_institute_id()
RETURNS UUID AS $$
  SELECT institute_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_of(inst_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin' AND institute_id = inst_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_teacher_of_batch(b_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.batches 
    WHERE teacher_id = auth.uid() AND id = b_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 5. Wipe existing RLS policies to apply the new multi-tenant SaaS architecture cleanly
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Batches
DROP POLICY IF EXISTS "Admins can manage all batches" ON public.batches;
DROP POLICY IF EXISTS "Teachers can view assigned batches" ON public.batches;

-- Students
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;

-- 6. Apply strictly isolated RLS Policies
-- PLATFORM/INSTITUTES Level Settings
CREATE POLICY "Institutes access" ON public.institutes
  FOR ALL USING (
    public.is_master_admin() OR 
    id = public.get_my_institute_id()
  );

-- PROFILES Policies
CREATE POLICY "Profiles access" ON public.profiles
  FOR ALL USING (
    public.is_master_admin() OR
    id = auth.uid() OR
    (public.is_admin_of(institute_id) AND institute_id = public.get_my_institute_id())
  );

-- BATCHES Policies
CREATE POLICY "Batches access" ON public.batches
  FOR ALL USING (
    public.is_master_admin() OR
    (public.is_admin_of(institute_id)) OR
    (teacher_id = auth.uid()) OR -- Teacher assigned to batch
    (EXISTS (SELECT 1 FROM public.students WHERE batch_id = id AND profile_id = auth.uid())) -- Student in batch
  );

-- STUDENTS Policies
CREATE POLICY "Students access" ON public.students
  FOR ALL USING (
    public.is_master_admin() OR
    (public.is_admin_of(institute_id)) OR
    (EXISTS (SELECT 1 FROM public.batches WHERE id = batch_id AND teacher_id = auth.uid())) OR -- Teacher of their batch
    profile_id = auth.uid() -- It is the student themselves
  );

-- TEACHERS Policies
CREATE POLICY "Teachers access" ON public.teachers
  FOR ALL USING (
    public.is_master_admin() OR
    (public.is_admin_of(institute_id)) OR
    profile_id = auth.uid() -- The teacher themselves
  );

-- ATTENDANCE Policies
CREATE POLICY "Attendance access" ON public.attendance
  FOR ALL USING (
    public.is_master_admin() OR
    (public.is_admin_of(institute_id)) OR
    (EXISTS (SELECT 1 FROM public.batches WHERE id = batch_id AND teacher_id = auth.uid())) OR -- Teacher of the batch
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid()) -- The student themselves
  );

-- TESTS Policies
CREATE POLICY "Tests access" ON public.tests
  FOR ALL USING (
    public.is_master_admin() OR
    (public.is_admin_of(institute_id)) OR
    created_by = auth.uid() OR -- Teacher who created it
    (EXISTS (SELECT 1 FROM public.students WHERE batch_id = public.tests.batch_id AND profile_id = auth.uid())) -- Student in the test's batch
  );

-- RESULTS Policies
CREATE POLICY "Results access" ON public.results
  FOR ALL USING (
    public.is_master_admin() OR
    (public.is_admin_of(institute_id)) OR
    (EXISTS (SELECT 1 FROM public.tests WHERE id = test_id AND created_by = auth.uid())) OR -- Teacher who created the test
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid()) -- The student themselves
  );

-- MATERIALS Policies
CREATE POLICY "Materials access" ON public.materials
  FOR ALL USING (
    public.is_master_admin() OR
    (public.is_admin_of(institute_id)) OR
    uploaded_by = auth.uid() OR -- Teacher who uploaded it
    (EXISTS (SELECT 1 FROM public.students WHERE batch_id = public.materials.batch_id AND profile_id = auth.uid())) -- Student in the batch
  );

-- 7. Update handle_new_user trigger to populate institute_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, institute_id)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'role')::public.app_role, 'student'::public.app_role),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    (new.raw_user_meta_data->>'institute_id')::UUID
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
