
-- Enable RLS and policies for chat history on note_chats table
ALTER TABLE public.note_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to select their own note chats"
  ON public.note_chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own note chats"
  ON public.note_chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS and policies for sessions table
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to select their own study sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own study sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);
