import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
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
  const { user } = useUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const uploadAndProcess = async (audioBlobOrUrl: Blob | string): Promise<AudioUploadResult | null> => {
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
    setCurrentStep("Starting...");

    try {
      // Step 1: Convert blob URL to File object
      setCurrentStep("Preparing audio file...");
      setProgress(5);
      
      let audioFile: File;
      
      if (typeof audioBlobOrUrl === 'string' && audioBlobOrUrl.startsWith('blob:')) {
        console.log('🔄 Converting blob URL to File object:', audioBlobOrUrl);
        const response = await fetch(audioBlobOrUrl);
        const blob = await response.blob();
        audioFile = new File([blob], `lecture-${Date.now()}.mp3`, { type: 'audio/mpeg' });
        console.log('✅ Converted to File:', audioFile.name, audioFile.type, audioFile.size);
      } else if (audioBlobOrUrl instanceof Blob) {
        audioFile = new File([audioBlobOrUrl], `lecture-${Date.now()}.mp3`, { type: 'audio/mpeg' });
        console.log('✅ Using provided Blob as File:', audioFile.name, audioFile.type, audioFile.size);
      } else {
        throw new Error('Invalid audio input. Expected Blob or blob URL.');
      }

      // Step 2: Upload to Supabase Storage
      setCurrentStep("Uploading to cloud storage...");
      setProgress(15);
      
      const filePath = `user-audio/${Date.now()}-${audioFile.name}`;
      console.log("🪪 Current user ID:", user.id);
      console.log('📤 Uploading audio file to Supabase:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(filePath, audioFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: audioFile.type
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ Upload successful:', uploadData.path);
      setProgress(25);

      // Step 3: Generate signed URL for AssemblyAI
      setCurrentStep("Generating secure access URL...");
      setProgress(30);
      
      console.log('🔒 Generating signed URL for AssemblyAI...');
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('audio-uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedUrlError) {
        console.error('❌ Signed URL error:', signedUrlError);
        throw new Error(`Failed to generate signed URL: ${signedUrlError.message}`);
      }

      const audioUrl = signedUrlData.signedUrl;
      console.log('✅ Signed URL generated for AssemblyAI');
      setProgress(35);

      // Step 4: Send to AssemblyAI for transcription
      setCurrentStep("Transcribing with AI...");
      setProgress(40);
      
      console.log('🎯 Sending to AssemblyAI for transcription...');
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_url: audioUrl }),
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        console.error('❌ AssemblyAI transcription failed:', errorData);
        throw new Error(errorData.error || 'Transcription failed');
      }

      const { text: transcriptText, duration } = await transcribeResponse.json();
      console.log('✅ Transcription received:', transcriptText.length, 'characters');
      setProgress(70);

      // Step 5: Generate AI notes using GROQ with qwen-qwq-32b
      setCurrentStep("Generating smart notes...");
      setProgress(75);
      
      console.log('🤖 Generating AI notes with meta-llama/llama-4-scout-17b-16e-instruct...');
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
          model: 'groq'
        }),
      });

      if (!aiResponse.ok) {
        console.error('❌ AI notes generation failed');
        throw new Error('Failed to generate AI notes');
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.response || aiData.message || '';

      // Parse summary and notes from AI response
      const sections = aiContent.split(/(?:^|\n)(?:##?\s*(?:Summary|Notes|Detailed))/i);
      const summary = sections[1]?.trim() || aiContent.substring(0, 500) + '...';
      const notes = sections[2]?.trim() || aiContent;

      setCurrentStep("Finalizing...");
      setProgress(100);

      console.log('🎉 Audio processing completed successfully');

      // Get public URL for display purposes
      const { data: publicUrlData } = supabase.storage
        .from('audio-uploads')
        .getPublicUrl(filePath);

      const result: AudioUploadResult = {
        audioUrl: publicUrlData.publicUrl,
        transcription: transcriptText,
        summary,
        notes,
        metadata: {
          provider: 'AssemblyAI + GROQ',
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          timestamp: new Date().toISOString(),
          duration
        }
      };

      toast({
        title: "✅ Notes generated from your lecture!",
        description: "Your audio has been transcribed and smart notes created.",
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
      setCurrentStep("");
    }
  };

  return {
    uploadAndProcess,
    isProcessing,
    progress,
    currentStep
  };
};
