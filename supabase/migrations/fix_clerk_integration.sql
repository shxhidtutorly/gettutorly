
-- Fix Supabase integration with Clerk
-- Add clerk_user_id columns where missing and create proper RLS policies

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_chats ENABLE ROW LEVEL SECURITY;

-- Ensure clerk_user_id column exists on all tables
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE public.study_progress ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE public.user_activity_logs ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
-- note_chats already has clerk_user_id

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON public.users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_clerk_user_id ON public.study_materials(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_notes_clerk_user_id ON public.notes(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_clerk_user_id ON public.study_progress(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_clerk_user_id ON public.user_activity_logs(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_note_chats_clerk_user_id ON public.note_chats(clerk_user_id);

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view their own progress" ON public.study_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.study_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.study_progress;
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.user_activity_logs;

-- Create new RLS policies using clerk_user_id
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

-- Note chats policies
CREATE POLICY "Allow users to view their own note chats" 
  ON public.note_chats FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to insert their own note chats" 
  ON public.note_chats FOR INSERT 
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to update their own note chats" 
  ON public.note_chats FOR UPDATE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');
  
CREATE POLICY "Allow users to delete their own note chats" 
  ON public.note_chats FOR DELETE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
