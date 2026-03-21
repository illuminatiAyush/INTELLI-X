-- Fix for RLS Recursion and 500 Errors
-- This script breaks the circular dependency between batches and students tables.

-- 1. Create specialized SECURITY DEFINER helper functions
-- These functions bypass RLS and allow us to check relationships safely.

-- Check if a user is a student in a specific batch
CREATE OR REPLACE FUNCTION public.check_is_student_in_batch(b_id UUID, p_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students 
    WHERE batch_id = b_id AND profile_id = p_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get the caller's role safely (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if a user is the teacher of a specific batch
CREATE OR REPLACE FUNCTION public.check_is_teacher_of_batch(b_id UUID, p_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.batches 
    WHERE id = b_id AND teacher_id = p_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if a user is a student in ANY batch belonging to a specific teacher
CREATE OR REPLACE FUNCTION public.check_is_student_of_teacher(t_id UUID, s_profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.batches b ON s.batch_id = b.id
    WHERE b.teacher_id = t_id AND s.profile_id = s_profile_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Drop and recreate policies with non-recursive logic

-- BATCHES Policies
DROP POLICY IF EXISTS "Batches access" ON public.batches;
CREATE POLICY "Batches access" ON public.batches
  FOR ALL USING (
    public.is_master_admin() OR
    public.is_admin_of(institute_id) OR
    (teacher_id = auth.uid()) OR
    public.check_is_student_in_batch(id, auth.uid())
  );

-- STUDENTS Policies
DROP POLICY IF EXISTS "Students access" ON public.students;
CREATE POLICY "Students access" ON public.students
  FOR ALL USING (
    public.is_master_admin() OR
    public.is_admin_of(institute_id) OR
    public.check_is_teacher_of_batch(batch_id, auth.uid()) OR
    profile_id = auth.uid()
  );

-- ATTENDANCE Policies
DROP POLICY IF EXISTS "Attendance access" ON public.attendance;
CREATE POLICY "Attendance access" ON public.attendance
  FOR ALL USING (
    public.is_master_admin() OR
    public.is_admin_of(institute_id) OR
    public.check_is_teacher_of_batch(batch_id, auth.uid()) OR
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
  );

-- TESTS Policies
DROP POLICY IF EXISTS "Tests access" ON public.tests;
CREATE POLICY "Tests access" ON public.tests
  FOR ALL USING (
    public.is_master_admin() OR
    public.is_admin_of(institute_id) OR
    created_by = auth.uid() OR
    public.check_is_student_in_batch(batch_id, auth.uid())
  );

-- RESULTS Policies
DROP POLICY IF EXISTS "Results access" ON public.results;
CREATE POLICY "Results access" ON public.results
  FOR ALL USING (
    public.is_master_admin() OR
    public.is_admin_of(institute_id) OR
    (EXISTS (SELECT 1 FROM public.tests WHERE id = test_id AND created_by = auth.uid())) OR
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
  );

-- PROFILES Policies (Safe from recursion)
DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
CREATE POLICY "Profiles access" ON public.profiles
  FOR ALL USING (
    id = auth.uid() OR
    public.get_my_role() = 'master_admin' OR
    (public.is_admin_of(institute_id) AND institute_id = public.get_my_institute_id())
  );

-- MATERIALS Policies
DROP POLICY IF EXISTS "Materials access" ON public.materials;
CREATE POLICY "Materials access" ON public.materials
  FOR ALL USING (
    public.is_master_admin() OR
    public.is_admin_of(institute_id) OR
    uploaded_by = auth.uid() OR
    public.check_is_student_in_batch(batch_id, auth.uid())
  );
