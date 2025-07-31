import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Sparkles, Trash2, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CreateFlashcardDialog from "@/components/features/CreateFlashcardDialog";
import { motion, AnimatePresence } from "framer-motion";

// Assuming the type definition from your service
export interface Flashcard {
  id: number | string;
  question: string;
  answer: string;
}

interface FlashcardItem {
  id: number | string;
  front: string;
  back:string;
}

interface FlashcardSets {
  [key: string]: FlashcardItem[];
}

interface SetName {
  id: string;
  name: string;
}

// --- Neon Brutalist UI Configuration ---
const neonColors = {
  cyan: 'border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff]',
  green: 'border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e]',
  pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
  yellow: 'border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15]',
};

const Flashcards = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [activeSet, setActiveSet] = useState("ai-generated");
  const [aiFlashcards, setAiFlashcards] = useState<Flashcard[]>([]);
  const [aiSource, setAiSource] = useState<string>("");
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSets>({});
  const [setNames, setSetNames] = useState<SetName[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- Data Loading and Saving Hooks ---
  useEffect(() => {
    const savedFlashcards = localStorage.getItem("flashcards");
    const savedSource = localStorage.getItem("flashcards-source");
    if (savedFlashcards) {
      try {
        const parsedCards = JSON.parse(savedFlashcards);
        setAiFlashcards(parsedCards);
        // If there are AI cards, make that the default active set
        if (parsedCards.length > 0) {
            setActiveSet("ai-generated");
        }
      } catch (error) {
        console.error("Error parsing saved flashcards:", error);
      }
    }
    if (savedSource) setAiSource(savedSource);
  }, []);

  useEffect(() => {
    const savedSets = localStorage.getItem("user-flashcard-sets");
    const savedNames = localStorage.getItem("user-flashcard-set-names");
    if (savedSets) setFlashcardSets(JSON.parse(savedSets));
    if (savedNames) {
        const parsedNames = JSON.parse(savedNames);
        setSetNames(parsedNames);
        // If there are no AI cards but there are user sets, select the first user set
        if (aiFlashcards.length === 0 && parsedNames.length > 0) {
            setActiveSet(parsedNames[0].id);
        }
    }
  }, [aiFlashcards.length]); // Rerun if AI cards are cleared

  useEffect(() => {
    localStorage.setItem("user-flashcard-sets", JSON.stringify(flashcardSets));
    localStorage.setItem("user-flashcard-set-names", JSON.stringify(setNames));
  }, [flashcardSets, setNames]);

  // --- Core Component Logic ---
  const toggleFlip = (id: string | number) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateFlashcardSet = (setName: string, cards: { front: string; back: string }[]) => {
    const setId = setName.toLowerCase().replace(/\s+/g, "-") + `-${Date.now()}`;
    if (flashcardSets[setId]) {
      toast({ title: "Set already exists", variant: "destructive" });
      return;
    }
    const cardsWithIds = cards.map((card, index) => ({
      ...card,
      id: `${setId}-${index}`,
    }));
    setFlashcardSets(prev => ({ ...prev, [setId]: cardsWithIds }));
    setSetNames(prev => [...prev, { id: setId, name: setName }]);
    setActiveSet(setId);
    toast({ title: "Flashcard set created!" });
  };

  const clearAIFlashcards = () => {
    localStorage.removeItem("flashcards");
    localStorage.removeItem("flashcards-source");
    setAiFlashcards([]);
    setAiSource("");
    // Switch to the first available user set, or an empty state
    setActiveSet(setNames[0]?.id || "");
    toast({ title: "AI flashcards cleared" });
  };

  // --- Render Functions ---
  const renderCard = (card: { id: string | number; front: string; back: string }, color: string) => (
    <motion.div
      key={card.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative h-72 w-full [perspective:1000px]"
      onClick={() => toggleFlip(card.id)}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped[card.id] ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Card Front */}
        <div className={`absolute w-full h-full flex flex-col items-center justify-center p-6 bg-gray-900 border-2 rounded-none [backface-visibility:hidden] ${color}`}>
            <p className="text-xl font-bold text-center text-white">{card.front}</p>
            <span className="absolute bottom-4 text-xs text-gray-400">Click to Flip</span>
        </div>
        {/* Card Back */}
        <div className={`absolute w-full h-full flex flex-col items-center justify-center p-6 bg-gray-800 border-2 rounded-none [transform:rotateY(180deg)] [backface-visibility:hidden] ${color}`}>
            <p className="text-lg text-center text-white">{card.back}</p>
            <span className="absolute bottom-4 text-xs text-gray-400">Click to Flip</span>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      <main className="flex-1 py-8 px-4 pb-24 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          
          {/* --- Header --- */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
          >
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-3">
                <Zap className="w-10 h-10 text-yellow-400" />
                Flashcards
              </h1>
              <p className="text-gray-400 mt-1">Master concepts with AI and custom sets.</p>
            </div>
            <div className="flex items-center gap-3">
              <CreateFlashcardDialog onSave={handleCreateFlashcardSet} />
              <Button
                className="bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black transition-all duration-200 shadow-[4px_4px_0px_#00f7ff] hover:shadow-[6px_6px_0px_#00f7ff] h-12 px-5"
                onClick={() => navigate("/ai-notes")}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Create with AI
              </Button>
            </div>
          </motion.div>

          {/* --- Tabs for Sets --- */}
          <Tabs value={activeSet} onValueChange={setActiveSet} className="w-full">
            <TabsList className="flex flex-wrap h-auto p-2 bg-gray-900 border-2 border-gray-700 rounded-none mb-8">
              {aiFlashcards.length > 0 && (
                <TabsTrigger value="ai-generated" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black data-[state=active]:shadow-[4px_4px_0px_#00f7ff] flex-1 rounded-none font-bold">
                  <Sparkles className="h-5 w-5 mr-2" /> AI Generated <Badge className="ml-2 bg-black text-white">{aiFlashcards.length}</Badge>
                </TabsTrigger>
              )}
              {setNames.map(set => (
                <TabsTrigger key={set.id} value={set.id} className="data-[state=active]:bg-pink-500 data-[state=active]:text-black data-[state=active]:shadow-[4px_4px_0px_#ec4899] flex-1 rounded-none font-bold">
                  <BookOpen className="h-5 w-5 mr-2" /> {set.name} <Badge className="ml-2 bg-black text-white">{flashcardSets[set.id]?.length || 0}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* AI Flashcards Content */}
            {aiFlashcards.length > 0 && (
              <TabsContent value="ai-generated">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-cyan-400">Source: {aiSource || "AI Note"}</h3>
                    <Button onClick={clearAIFlashcards} variant="destructive" size="sm" className="rounded-none font-bold border-2 border-pink-500 bg-transparent text-pink-500 hover:bg-pink-500 hover:text-black">
                        <Trash2 className="h-4 w-4 mr-2" /> Clear AI Cards
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {aiFlashcards.map(card => renderCard({id: card.id, front: card.question, back: card.answer}, neonColors.cyan))}
                  </AnimatePresence>
                </div>
              </TabsContent>
            )}

            {/* User Sets Content */}
            {setNames.map(set => (
              <TabsContent key={set.id} value={set.id}>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {flashcardSets[set.id]?.map(card => renderCard(card, neonColors.pink))}
                    </AnimatePresence>
                    {/* Add New Card Button - Not implemented in dialog */}
                 </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Empty State for no sets at all */}
          {aiFlashcards.length === 0 && setNames.length === 0 && (
             <motion.div 
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="text-center py-20 flex flex-col items-center"
            >
                <Zap className="w-24 h-24 text-yellow-500 mb-4"/>
                <h2 className="text-3xl font-black text-white">No Flashcards Found</h2>
                <p className="text-gray-400 mt-2 mb-6 max-w-md">
                    Create a new set manually or generate one from your notes to get started.
                </p>
                <div className="flex gap-4">
                    <CreateFlashcardDialog onSave={handleCreateFlashcardSet} />
                     <Button
                        className="bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black transition-all duration-200 shadow-[4px_4px_0px_#00f7ff] hover:shadow-[6px_6px_0px_#00f7ff] h-12 px-5"
                        onClick={() => navigate("/ai-notes")}
                    >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate with AI
                    </Button>
                </div>
            </motion.div>
          )}

        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Flashcards;
