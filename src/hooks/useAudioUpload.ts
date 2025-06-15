import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AudioUploadResult {
  audioUrl: string;
  transcription: string;
  summary: string;
  notes: string;
  metadata: {
    provider: string;
    model: string;
    timestamp: string;
    duration?: number;
  };
}

export const useAudioUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadAndProcess = async (audioBlob: Blob): Promise<AudioUploadResult | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload audio files.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(10);
      const file = new File([audioBlob], `lecture-${Date.now()}.mp3`, { type: 'audio/mpeg' });

      // FIX RLS: Path must start with user.id for policy to allow insert.
      const fileName = `${user.id}/${Date.now()}.mp3`;

      console.log("🪪 Current user ID:", user.id);
      console.log('📤 Uploading audio file to Supabase with user folder:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setProgress(25);

      const { data: publicUrlData } = supabase.storage
        .from('audio-uploads')
        .getPublicUrl(fileName);

      console.log('🔗 Generated public URL:', publicUrlData.publicUrl);
      setProgress(35);

      // Step 2: Send to AssemblyAI for transcription
      console.log('🎯 Sending to AssemblyAI for transcription...');
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_url: publicUrlData.publicUrl }),
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const { text: transcriptText, duration } = await transcribeResponse.json();
      console.log('✅ Transcription received:', transcriptText.length, 'characters');
      setProgress(70);

      // Step 3: Send transcript to AI for notes generation
      console.log('🤖 Generating AI notes with qwen-qwq-32b...');
      const notesPrompt = `You are an expert note-taker and study assistant. Based on this lecture transcription, create comprehensive study notes and a concise summary.

TRANSCRIPTION:
${transcriptText}

Please provide:
1. A concise summary (2-3 paragraphs) highlighting the main points
2. Detailed structured notes with key concepts, definitions, and important details

Format the notes with clear headings and bullet points for easy studying.`;

      const aiResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: notesPrompt,
          model: 'qwen-qwq-32b'
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to generate AI notes');
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.response || aiData.message || '';

      // Simple parsing of summary + notes
      const sections = aiContent.split(/(?:^|\n)(?:##?\s*(?:Summary|Notes|Detailed))/i);
      const summary = sections[1]?.trim() || aiContent.substring(0, 500) + '...';
      const notes = sections[2]?.trim() || aiContent;

      setProgress(100);

      console.log('🎉 Audio processing completed successfully');

      const result: AudioUploadResult = {
        audioUrl: publicUrlData.publicUrl,
        transcription: transcriptText,
        summary,
        notes,
        metadata: {
          provider: 'AssemblyAI + GROQ',
          model: 'qwen-qwq-32b',
          timestamp: new Date().toISOString(),
          duration
        }
      };

      toast({
        title: "Audio processed successfully! 🎉",
        description: "Your lecture has been transcribed and notes generated.",
      });

      return result;

    } catch (error: any) {
      console.error('❌ Audio processing error:', error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process audio. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    uploadAndProcess,
    isProcessing,
    progress
  };
};
