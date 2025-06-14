
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface LiveTranscriptProps {
  transcript: string;
  isRecording: boolean;
}

const LiveTranscript = ({ transcript, isRecording }: LiveTranscriptProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcript arrives
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [transcript]);

  const sentences = transcript.split('.').filter(s => s.trim());

  return (
    <div className="h-96">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="space-y-2 pr-4">
          {transcript ? (
            <AnimatePresence>
              {sentences.map((sentence, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-gray-300 leading-relaxed"
                >
                  {sentence.trim()}.
                </motion.p>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {isRecording ? (
                <div className="text-center">
                  <div className="animate-pulse mb-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full mx-auto"></div>
                  </div>
                  <p>Listening for speech...</p>
                </div>
              ) : (
                <p>Start recording to see live transcript</p>
              )}
            </div>
          )}
          
          {isRecording && (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-2 mt-4 text-gray-400"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Transcribing...</span>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LiveTranscript;
