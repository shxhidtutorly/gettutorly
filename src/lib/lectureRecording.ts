
import { supabase } from '@/integrations/supabase/client';

export interface LectureSession {
  id?: string;
  user_id: string;
  title: string;
  transcript?: string;
  ai_notes?: string;
  start_time: Date;
  end_time?: Date;
  audio_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const createLectureSession = async (userId: string, sessionData: Partial<LectureSession>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('lecture_sessions')
      .insert([{
        user_id: userId,
        title: sessionData.title || `Lecture ${new Date().toLocaleDateString()}`,
        start_time: sessionData.start_time || new Date(),
        transcript: '',
        ai_notes: '',
        created_at: new Date(),
        updated_at: new Date(),
      }])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating lecture session:', error);
    throw error;
  }
};

export const updateLectureSession = async (sessionId: string, updates: Partial<LectureSession>) => {
  try {
    const { error } = await supabase
      .from('lecture_sessions')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating lecture session:', error);
    throw error;
  }
};

export const getLectureSessions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('lecture_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching lecture sessions:', error);
    return [];
  }
};

export const deleteLectureSession = async (sessionId: string) => {
  try {
    const { error } = await supabase
      .from('lecture_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting lecture session:', error);
    throw error;
  }
};
