
-- Create note_chats table for storing chat messages with notes
CREATE TABLE IF NOT EXISTS public.note_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    note_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_note_chats_user_id ON public.note_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_note_chats_note_id ON public.note_chats(note_id);
CREATE INDEX IF NOT EXISTS idx_note_chats_created_at ON public.note_chats(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.note_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own chat messages" ON public.note_chats
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own chat messages" ON public.note_chats
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own chat messages" ON public.note_chats
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own chat messages" ON public.note_chats
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.note_chats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
