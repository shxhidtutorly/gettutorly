
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchItem {
  key: string;
  label: string;
  route: string;
  keywords: string[];
}

const searchItems: SearchItem[] = [
  { key: "ai-notes", label: "AI Notes", route: "/ai-notes", keywords: ["notes", "ai", "generate", "smart"] },
  { key: "quiz", label: "Quiz Center", route: "/quiz", keywords: ["quiz", "test", "questions", "exam"] },
  { key: "flashcards", label: "Flashcards", route: "/flashcards", keywords: ["flash", "cards", "review", "memorize"] },
  { key: "summarize", label: "Summarize", route: "/summaries", keywords: ["summary", "summarize", "condense"] },
  { key: "math", label: "Math Chat", route: "/math-chat", keywords: ["math", "calculator", "solve", "equations"] },
  { key: "audio", label: "Audio Notes", route: "/audio-notes", keywords: ["audio", "voice", "record", "transcribe"] },
  { key: "doubt", label: "Doubt Chain", route: "/doubt-chain", keywords: ["doubt", "chain", "questions", "clarify"] },
  { key: "assistant", label: "AI Assistant", route: "/ai-assistant", keywords: ["assistant", "help", "ai", "chat"] },
  { key: "progress", label: "Progress", route: "/progress", keywords: ["progress", "stats", "analytics", "tracking"] },
  { key: "library", label: "Library", route: "/library", keywords: ["library", "materials", "documents", "files"] },
  { key: "plans", label: "Study Plans", route: "/study-plans", keywords: ["plans", "schedule", "organize", "study"] }
];

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const filteredItems = useMemo(() => {
    if (!query.trim()) return searchItems;

    const searchTerm = query.toLowerCase().trim();
    return searchItems.filter(item => 
      item.label.toLowerCase().includes(searchTerm) ||
      item.key.includes(searchTerm) ||
      item.keywords.some(keyword => keyword.includes(searchTerm))
    );
  }, [query]);

  const handleSearch = (selectedQuery: string) => {
    const item = searchItems.find(item => 
      item.key === selectedQuery || 
      item.label.toLowerCase() === selectedQuery.toLowerCase()
    );

    if (item) {
      navigate(item.route);
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  return {
    query,
    setQuery: handleInputChange,
    isOpen,
    setIsOpen,
    filteredItems,
    handleSearch
  };
};
