
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  Sparkles, 
  Users, 
  StickyNote, 
  Zap, 
  HelpCircle, 
  Brain, 
  BookOpen, 
  MessageCircle, 
  TrendingUp 
} from "lucide-react";

interface SearchDropdownProps {
  show: boolean;
  query: string;
  onSelect: (query: string) => void;
  onClose: () => void;
}

const searchItems = [
  { key: "ai notes", label: "AI Notes", icon: <Sparkles className="h-4 w-4" />, route: "/ai-notes" },
  { key: "quiz", label: "Quiz Center", icon: <HelpCircle className="h-4 w-4" />, route: "/quiz" },
  { key: "flashcards", label: "Flashcards", icon: <Zap className="h-4 w-4" />, route: "/flashcards" },
  { key: "summarize", label: "Summarize", icon: <StickyNote className="h-4 w-4" />, route: "/summaries" },
  { key: "math", label: "Math Chat", icon: <Calculator className="h-4 w-4" />, route: "/math-chat" },
  { key: "audio", label: "Audio Notes", icon: <Users className="h-4 w-4" />, route: "/audio-notes" },
  { key: "doubt", label: "Doubt Chain", icon: <Brain className="h-4 w-4" />, route: "/doubt-chain" },
  { key: "assistant", label: "AI Assistant", icon: <MessageCircle className="h-4 w-4" />, route: "/ai-assistant" },
  { key: "progress", label: "Progress", icon: <TrendingUp className="h-4 w-4" />, route: "/progress" },
  { key: "library", label: "Library", icon: <BookOpen className="h-4 w-4" />, route: "/library" }
];

const SearchDropdown = ({ show, query, onSelect, onClose }: SearchDropdownProps) => {
  const filteredItems = searchItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.key.includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {show && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-40"
          >
            <Card className="bg-[#1A1A1A] border-gray-700 shadow-xl">
              <CardContent className="p-2">
                {filteredItems.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    No features found
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => {
                        onSelect(item.key);
                        onClose();
                      }}
                    >
                      <div className="text-purple-400">
                        {item.icon}
                      </div>
                      <span className="text-white text-sm font-medium">{item.label}</span>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchDropdown;
