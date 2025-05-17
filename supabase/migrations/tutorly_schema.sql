
-- Create necessary tables for Tutorly app

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pgtap";

-- Users table (extends the auth.users table)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Study materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  file_name TEXT,
  file_url TEXT,
  content_type TEXT,
  size INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Study notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Study progress table
CREATE TABLE IF NOT EXISTS public.study_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  completed BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- User activity logs (for analytics)
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security policies

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Study materials policies
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own materials" 
  ON public.study_materials FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own materials" 
  ON public.study_materials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own materials" 
  ON public.study_materials FOR UPDATE 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own materials" 
  ON public.study_materials FOR DELETE 
  USING (auth.uid() = user_id);

-- Notes policies
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes" 
  ON public.notes FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own notes" 
  ON public.notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own notes" 
  ON public.notes FOR UPDATE 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own notes" 
  ON public.notes FOR DELETE 
  USING (auth.uid() = user_id);

-- Study progress policies
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" 
  ON public.study_progress FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own progress" 
  ON public.study_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own progress" 
  ON public.study_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- Activity logs policies
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs" 
  ON public.user_activity_logs FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own activity logs" 
  ON public.user_activity_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket and policies
INSERT INTO storage.buckets (id, name, public) VALUES ('study_materials', 'study_materials', true);

CREATE POLICY "Study materials are accessible by their owners"
  ON storage.objects FOR SELECT
  USING (auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can upload study materials to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can update their own study materials"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can delete their own study materials"
  ON storage.objects FOR DELETE
  USING (auth.uid() = (storage.foldername(name))[1]::uuid);
