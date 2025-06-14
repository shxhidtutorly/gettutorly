
-- Create lecture_sessions table for storing lecture recording data
CREATE TABLE public.lecture_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  transcript TEXT DEFAULT '',
  ai_notes TEXT DEFAULT '',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lecture_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for lecture_sessions
CREATE POLICY "Users can view their own lecture sessions" 
  ON public.lecture_sessions 
  FOR SELECT 
  USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can create their own lecture sessions" 
  ON public.lecture_sessions 
  FOR INSERT 
  WITH CHECK (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update their own lecture sessions" 
  ON public.lecture_sessions 
  FOR UPDATE 
  USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete their own lecture sessions" 
  ON public.lecture_sessions 
  FOR DELETE 
  USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER handle_updated_at_lecture_sessions
  BEFORE UPDATE ON public.lecture_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
