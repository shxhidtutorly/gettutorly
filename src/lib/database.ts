
import { supabase } from '@/integrations/supabase/client';

// USER OPERATIONS
export const createUserProfile = async (userData: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// STUDY MATERIALS OPERATIONS
export const saveStudyMaterial = async (materialData: any) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .insert([materialData])
      .select()
      .single();
      
    if (error) {
      console.error('Error saving study material:', error);
      throw error;
    }
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: materialData.user_id,
      p_stat_type: 'materials_created',
      p_increment: 1
    });
    
    return data.id;
  } catch (error) {
    console.error("Error saving study material:", error);
    throw error;
  }
};

export const getUserStudyMaterials = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting study materials:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error getting user study materials:", error);
    throw error;
  }
};

// NOTES OPERATIONS
export const createNote = async (noteData: any) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: noteData.user_id,
      p_stat_type: 'notes_created',
      p_increment: 1
    });
    
    return data.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const getUserNotes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error getting user notes:", error);
    throw error;
  }
};

// FLASHCARDS OPERATIONS
export const createFlashcard = async (flashcardData: any) => {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .insert([flashcardData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: flashcardData.user_id,
      p_stat_type: 'flashcards_created',
      p_increment: 1
    });
    
    return data;
  } catch (error) {
    console.error("Error creating flashcard:", error);
    throw error;
  }
};

export const getUserFlashcards = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting flashcards:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error getting user flashcards:", error);
    throw error;
  }
};

// QUIZ OPERATIONS
export const createQuiz = async (quizData: any) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: quizData.user_id,
      p_stat_type: 'quizzes_created',
      p_increment: 1
    });
    
    return data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

export const recordQuizAttempt = async (attemptData: any) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([attemptData])
      .select()
      .single();
      
    if (error) {
      console.error('Error recording quiz attempt:', error);
      throw error;
    }
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: attemptData.user_id,
      p_stat_type: 'quizzes_taken',
      p_increment: 1
    });
    
    return data;
  } catch (error) {
    console.error("Error recording quiz attempt:", error);
    throw error;
  }
};

// SUMMARIES OPERATIONS
export const createSummary = async (summaryData: any) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .insert([summaryData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating summary:', error);
      throw error;
    }
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: summaryData.user_id,
      p_stat_type: 'summaries_created',
      p_increment: 1
    });
    
    return data;
  } catch (error) {
    console.error("Error creating summary:", error);
    throw error;
  }
};

// DOUBT CHAIN OPERATIONS
export const createDoubt = async (doubtData: any) => {
  try {
    const { data, error } = await supabase
      .from('doubt_chain')
      .insert([doubtData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating doubt:', error);
      throw error;
    }
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: doubtData.user_id,
      p_stat_type: 'doubts_asked',
      p_increment: 1
    });
    
    return data;
  } catch (error) {
    console.error("Error creating doubt:", error);
    throw error;
  }
};

// STUDY SESSIONS OPERATIONS
export const startStudySession = async (sessionData: any) => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert([sessionData])
      .select()
      .single();
      
    if (error) {
      console.error('Error starting study session:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error starting study session:", error);
    throw error;
  }
};

export const endStudySession = async (sessionId: string, duration: number) => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({ 
        duration, 
        ended_at: new Date().toISOString() 
      })
      .eq('id', sessionId)
      .select()
      .single();
      
    if (error) {
      console.error('Error ending study session:', error);
      throw error;
    }
    
    // Update total study time stat
    await supabase.rpc('update_user_stat', {
      p_user_id: data.user_id,
      p_stat_type: 'total_study_time',
      p_increment: duration
    });
    
    return data;
  } catch (error) {
    console.error("Error ending study session:", error);
    throw error;
  }
};

// FILE STORAGE OPERATIONS
export const uploadFile = async (userId: string, file: File) => {
  try {
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('study-materials')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('study-materials')
      .getPublicUrl(fileName);

    return {
      filePath: data.path,
      fileUrl: publicUrl,
      fileName: file.name,
      contentType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('study-materials')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
