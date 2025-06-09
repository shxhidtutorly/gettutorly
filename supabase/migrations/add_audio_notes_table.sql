
-- Create audio_notes table to track audio transcription sessions
CREATE TABLE IF NOT EXISTS public.audio_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  transcription TEXT,
  ai_notes TEXT,
  ai_summary TEXT,
  duration INTEGER, -- in seconds
  file_size INTEGER, -- in bytes
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audio_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own audio notes" 
  ON public.audio_notes FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own audio notes" 
  ON public.audio_notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own audio notes" 
  ON public.audio_notes FOR UPDATE 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own audio notes" 
  ON public.audio_notes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_audio_notes_user_id ON public.audio_notes(user_id);
CREATE INDEX idx_audio_notes_created_at ON public.audio_notes(created_at DESC);
