
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AINote {
  id: string;
  content: string;
  timestamp: Date;
}

interface AINotesProps {
  notes: AINote[];
  isProcessing: boolean;
}

const AINotesPanel = ({ notes, isProcessing }: AINotesProps) => {
  return (
    <div className="h-96">
      <ScrollArea className="h-full">
        <div className="space-y-4 pr-4">
          <AnimatePresence>
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-[#2A2A2A] p-4 rounded-lg border border-gray-600"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-400">
                    {note.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 p-4 text-gray-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating AI notes...</span>
            </motion.div>
          )}
          
          {notes.length === 0 && !isProcessing && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Brain className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p>AI notes will appear here as you record</p>
                <p className="text-sm text-gray-600 mt-1">Notes generate every 30 seconds or 400 words</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AINotesPanel;
