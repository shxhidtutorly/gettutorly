
-- Fix clerk_user_id column types to support Clerk's text format
-- Change from uuid to text for all tables that have clerk_user_id

-- Update user_activity_logs table
ALTER TABLE user_activity_logs ALTER COLUMN clerk_user_id TYPE text;

-- Update other tables to ensure clerk_user_id is text type
ALTER TABLE users ALTER COLUMN clerk_user_id TYPE text;
ALTER TABLE study_materials ALTER COLUMN clerk_user_id TYPE text;
ALTER TABLE notes ALTER COLUMN clerk_user_id TYPE text;
ALTER TABLE study_progress ALTER COLUMN clerk_user_id TYPE text;
ALTER TABLE study_plans ALTER COLUMN clerk_user_id TYPE text;

-- Update RLS policies to work with text clerk_user_id
-- Drop existing policies that might be using auth.uid()
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to view their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow users to insert their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow users to update their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow users to delete their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow users to view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Allow users to insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Allow users to update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Allow users to delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "Allow users to view their own progress" ON public.study_progress;
DROP POLICY IF EXISTS "Allow users to insert their own progress" ON public.study_progress;
DROP POLICY IF EXISTS "Allow users to update their own progress" ON public.study_progress;
DROP POLICY IF EXISTS "Allow users to view their own activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Allow users to insert their own activity logs" ON public.user_activity_logs;

-- Create new RLS policies that use clerk_user_id from JWT claims
-- Users table policies
CREATE POLICY "Allow users to view their own profile" 
  ON public.users FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to update their own profile" 
  ON public.users FOR UPDATE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Allow users to insert their own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Study materials policies
CREATE POLICY "Allow users to view their own materials" 
  ON public.study_materials FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to insert their own materials" 
  ON public.study_materials FOR INSERT 
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to update their own materials" 
  ON public.study_materials FOR UPDATE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to delete their own materials" 
  ON public.study_materials FOR DELETE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Notes policies
CREATE POLICY "Allow users to view their own notes" 
  ON public.notes FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to insert their own notes" 
  ON public.notes FOR INSERT 
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to update their own notes" 
  ON public.notes FOR UPDATE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to delete their own notes" 
  ON public.notes FOR DELETE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Study progress policies
CREATE POLICY "Allow users to view their own progress" 
  ON public.study_progress FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to insert their own progress" 
  ON public.study_progress FOR INSERT 
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to update their own progress" 
  ON public.study_progress FOR UPDATE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Activity logs policies
CREATE POLICY "Allow users to view their own activity logs" 
  ON public.user_activity_logs FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to insert their own activity logs" 
  ON public.user_activity_logs FOR INSERT 
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Study plans policies
CREATE POLICY "Allow users to view their own study plans" 
  ON public.study_plans FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to insert their own study plans" 
  ON public.study_plans FOR INSERT 
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to update their own study plans" 
  ON public.study_plans FOR UPDATE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to delete their own study plans" 
  ON public.study_plans FOR DELETE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
