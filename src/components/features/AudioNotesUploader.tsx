
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Mic, Upload, Loader2, FileAudio, Download, PlayCircle, PauseCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyTracking } from '@/hooks/useStudyTracking';

interface AudioNote {
  id: string;
  title: string;
  content: string;
  summary: string;
  audioUrl: string;
  filename: string;
  timestamp: string;
}

const AudioNotesUploader = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [audioNotes, setAudioNotes] = useState<AudioNote | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { currentUser } = useAuth();
  const { addSession } = useStudyTracking();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to upload audio files."
      });
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Check if file is audio
    if (!file.type.startsWith('audio/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, M4A, etc.)"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus('Uploading audio file...');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('filename', file.name);

      // Upload and process audio
      const response = await fetch('/api/audio-to-notes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const result = await response.json();
      
      const audioNote: AudioNote = {
        id: Date.now().toString(),
        title: `Audio Notes: ${file.name}`,
        content: result.notes,
        summary: result.summary,
        audioUrl: result.audioUrl,
        filename: file.name,
        timestamp: new Date().toISOString(),
      };

      setAudioNotes(audioNote);
      
      // Track session
      addSession({
        title: audioNote.title,
        type: 'audio-notes',
        duration: 5, // Estimate
        completed: true,
      });

      setProgress(100);
      setStatus('Audio notes generated successfully!');
      
      toast({
        title: "Success!",
        description: "Your audio has been transcribed and summarized.",
      });

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "Failed to process audio. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, addSession, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']
    },
    multiple: false,
    disabled: isProcessing
  });

  const togglePlayback = () => {
    if (!audioNotes?.audioUrl) return;

    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      const newAudio = new Audio(audioNotes.audioUrl);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      newAudio.addEventListener('error', () => {
        toast({
          variant: "destructive",
          title: "Playback error",
          description: "Unable to play audio file."
        });
        setIsPlaying(false);
      });
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    }
  };

  const downloadNotes = () => {
    if (!audioNotes) return;

    const content = `# ${audioNotes.title}\n\n## Summary\n${audioNotes.summary}\n\n## Detailed Notes\n${audioNotes.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audioNotes.filename}-notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const regenerateNotes = async () => {
    if (!audioNotes) return;

    setIsProcessing(true);
    setStatus('Regenerating notes...');

    try {
      const response = await fetch('/api/audio-to-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: audioNotes.audioUrl,
          regenerate: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate notes');
      }

      const result = await response.json();
      
      setAudioNotes(prev => prev ? {
        ...prev,
        content: result.notes,
        summary: result.summary,
      } : null);

      toast({
        title: "Success!",
        description: "Notes regenerated successfully.",
      });

    } catch (error) {
      console.error('Error regenerating notes:', error);
      toast({
        variant: "destructive",
        title: "Regeneration failed",
        description: "Failed to regenerate notes. Please try again."
      });
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Audio to AI Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <FileAudio className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-lg font-medium">
                {isProcessing ? status : isDragActive ? 'Drop your audio file here' : '🎙️ Drop your lecture audio here to get AI notes'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports MP3, WAV, M4A, AAC, OGG, FLAC
              </p>
              {!isProcessing && (
                <Button variant="outline" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">{status}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Notes Display */}
      {audioNotes && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{audioNotes.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayback}
                  disabled={!audioNotes.audioUrl}
                >
                  {isPlaying ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadNotes}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={regenerateNotes} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">📚 AI Summary</h3>
              <p className="text-muted-foreground">{audioNotes.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📄 Detailed Notes</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{audioNotes.content}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioNotesUploader;
