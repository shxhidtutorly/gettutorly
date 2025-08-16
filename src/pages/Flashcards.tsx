import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CreateFlashcardDialog from "@/components/features/CreateFlashcardDialog";
import type { Flashcard } from "@/lib/aiNotesService";

interface FlashcardItem {
  id: number | string;
  front: string;
  back: string;
}

interface FlashcardSets {
  [key: string]: FlashcardItem[];
}

interface SetName {
  id: string;
  name: string;
}

const Flashcards = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [activeSet, setActiveSet] = useState("ai-generated");
  const [aiFlashcards, setAiFlashcards] = useState<Flashcard[]>([]);
  const [aiSource, setAiSource] = useState<string>("");
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSets>({});
  const [setNames, setSetNames] = useState<SetName[]>([]);
  const { toast } = useToast();

  // Load AI-generated flashcards from localStorage
  useEffect(() => {
    const savedFlashcards = localStorage.getItem("flashcards");
    const savedSource = localStorage.getItem("flashcards-source");
    if (savedFlashcards) {
      try {
        setAiFlashcards(JSON.parse(savedFlashcards));
        setAiSource(savedSource || "AI Generated");
      } catch (error) {
        console.error("Error parsing saved flashcards:", error);
        setAiFlashcards([]);
      }
    }
  }, []);

  // Load custom sets and names from localStorage
  useEffect(() => {
    const savedSets = localStorage.getItem("user-flashcard-sets");
    const savedNames = localStorage.getItem("user-flashcard-set-names");
    if (savedSets) setFlashcardSets(JSON.parse(savedSets));
    if (savedNames) setSetNames(JSON.parse(savedNames));
  }, []);

  // Save sets/names to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("user-flashcard-sets", JSON.stringify(flashcardSets));
    localStorage.setItem("user-flashcard-set-names", JSON.stringify(setNames));
  }, [flashcardSets, setNames]);

  const toggleFlip = (id: string | number) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddNewFlashcard = (setId: string) => {
    const dialogTrigger = document.getElementById(`add-flashcard-button-${setId}`);
    if (dialogTrigger) dialogTrigger.click();
  };

  const handleCreateFlashcardSet = (setName: string, cards: { front: string; back: string }[]) => {
    const setId = setName.toLowerCase().replace(/\s+/g, "-");
    if (flashcardSets[setId]) {
      toast({
        title: "Set already exists",
        description: "A flashcard set with this name already exists. Please choose a different name.",
        variant: "destructive",
      });
      return;
    }
    const allIds = Object.values(flashcardSets).flat().map((c) => Number(c.id));
    const cardsWithIds = cards.map((card, index) => ({
      ...card,
      id: (Math.max(0, ...allIds) + index + 1).toString(),
    }));
    setFlashcardSets((prev) => ({
      ...prev,
      [setId]: cardsWithIds,
    }));
    setSetNames((prev) => [
      ...prev,
      { id: setId, name: setName },
    ]);
    setActiveSet(setId);
    toast({
      title: "Flashcard set created",
      description: `Successfully created "${setName}" with ${cards.length} cards.`,
    });
  };

  const handleAddFlashcard = (front: string, back: string) => {
    const allIds = Object.values(flashcardSets).flat().map((c) => Number(c.id));
    const newCard = {
      id: (Math.max(0, ...allIds) + 1).toString(),
      front,
      back,
    };
    setFlashcardSets((prev) => ({
      ...prev,
      [activeSet]: [...(prev[activeSet] || []), newCard],
    }));
    toast({
      title: "Flashcard added",
      description: "Successfully added new flashcard to the set.",
    });
  };

  const clearAIFlashcards = () => {
    localStorage.removeItem("flashcards");
    localStorage.removeItem("flashcards-source");
    setAiFlashcards([]);
    setAiSource("");
    setActiveSet(setNames[0]?.id || "");
    toast({
      title: "AI flashcards cleared",
      description: "All AI-generated flashcards have been removed.",
    });
  };

  // Styling for flip animation
  const cardWrapperClass = "relative h-64 w-full cursor-pointer group perspective";
  const cardInnerClass =
    "absolute w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:shadow-xl";
  const cardFrontClass =
    "absolute w-full h-full flex flex-col items-center justify-center p-6 rounded-xl bg-neutral-950 dark:bg-neutral-900 text-white border border-neutral-800 shadow-md [backface-visibility:hidden]";
  const cardBackClass =
    "absolute w-full h-full flex flex-col items-center justify-center p-6 rounded-xl bg-primary-800 text-white border border-primary-400 shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden]";
  const flippedStyle = { transform: "rotateY(180deg)" };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white dark:bg-background dark:text-foreground transition-colors duration-500">
      <Navbar />

      <main className="flex-1 py-8 px-2 pb-24 md:pb-8">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between gap-3 items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">Flashcards</h1>
              <p className="text-neutral-400 dark:text-muted-foreground">
                Master key concepts with AI-generated and custom flashcards
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button asChild variant="outline" className="bg-neutral-900 dark:bg-muted border-neutral-700 dark:border-muted">
                <a href="/ai-notes" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Notes
                </a>
              </Button>
              <Button
                variant="default"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold shadow-lg hover:scale-105 transition-transform"
                onClick={() => window.location.href = "/ai-notes"}
              >
                <Sparkles className="h-5 w-5" />
                Create AI Flashcards
              </Button>
              <CreateFlashcardDialog onSave={handleCreateFlashcardSet} />
            </div>
          </div>

          <Tabs value={activeSet} onValueChange={setActiveSet} className="w-full transition-all duration-700">
            <TabsList className={`grid mb-8 ${aiFlashcards.length > 0 ? "grid-cols-1 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"} gap-2`}>
              {aiFlashcards.length > 0 && (
                <TabsTrigger value="ai-generated" className="flex items-center gap-2 font-semibold group">
                  <BookOpen className="h-5 w-5" />
                  <span className="hidden sm:inline">AI Generated</span>
                  <Badge variant="secondary" className="ml-1">{aiFlashcards.length}</Badge>
                </TabsTrigger>
              )}
              {setNames.map((set) => (
                <TabsTrigger key={set.id} value={set.id} className="flex items-center gap-2 font-semibold group">
                  <Sparkles className="h-5 w-5" />
                  <span className="hidden sm:inline">{set.name}</span>
                  <Badge variant="secondary" className="ml-1">{flashcardSets[set.id]?.length || 0}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* AI Flashcards Tab */}
            {aiFlashcards.length > 0 && (
              <TabsContent value="ai-generated" className="transition-opacity duration-700 animate-fade-in">
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">AI Generated Flashcards</h3>
                    <p className="text-sm text-neutral-400 dark:text-muted-foreground">From: {aiSource}</p>
                  </div>
                  <Button onClick={clearAIFlashcards} variant="outline" size="sm">
                    Clear AI Cards
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiFlashcards.map((card) => (
                    <div
                      key={card.id}
                      className={cardWrapperClass}
                      onClick={() => toggleFlip(card.id)}
                    >
                      <div
                        className={cardInnerClass}
                        style={flipped[card.id] ? flippedStyle : undefined}
                      >
                        {/* Front */}
                        <div className={cardFrontClass + " bg-gradient-to-br from-gray-900 to-neutral-800"}>
                          <h3 className="text-lg font-bold text-center mb-3">{card.question}</h3>
                          <p className="text-xs text-neutral-400 dark:text-neutral-300 text-center">Click to flip</p>
                        </div>
                        {/* Back */}
                        <div className={cardBackClass + " bg-gradient-to-br from-primary to-blue-700"}>
                          <p className="text-center text-white text-base leading-relaxed">{card.answer}</p>
                          <p className="text-xs opacity-70 text-center mt-4">Click to flip back</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* User Flashcard Sets */}
            {setNames.map((set) => (
              <TabsContent key={set.id} value={set.id} className="transition-opacity duration-700 animate-fade-in">
                {flashcardSets[set.id]?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flashcardSets[set.id].map((card) => (
                      <div
                        key={card.id}
                        className={cardWrapperClass}
                        onClick={() => toggleFlip(card.id.toString())}
                      >
                        <div
                          className={cardInnerClass}
                          style={flipped[card.id.toString()] ? flippedStyle : undefined}
                        >
                          {/* Front */}
                          <div className={cardFrontClass + " bg-gradient-to-br from-gray-900 to-neutral-800"}>
                            <h3 className="text-xl font-bold text-center mb-3">{card.front}</h3>
                            <p className="text-xs text-neutral-400 dark:text-neutral-300 text-center">Click to flip</p>
                          </div>
                          {/* Back */}
                          <div className={cardBackClass + " bg-gradient-to-br from-primary to-blue-700"}>
                            <p className="text-center text-white text-base leading-relaxed">{card.back}</p>
                            <p className="text-xs opacity-70 text-center mt-4">Click to flip back</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Add Card Button */}
                    <div
                      id={`add-flashcard-container-${set.id}`}
                      className="flex items-center justify-center h-64"
                      onClick={() => handleAddNewFlashcard(set.id)}
                    >
                      <Card className="h-full w-full border-2 border-dashed border-primary-400 bg-gradient-to-br from-gray-900 to-neutral-800 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-all group">
                        <Plus className="h-9 w-9 text-primary mb-2 animate-pulse" />
                        <p className="text-center font-bold text-primary">Add New Flashcard</p>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="bg-neutral-800 rounded-full p-4 mb-4 animate-bounce">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No flashcards yet</h3>
                    <p className="text-neutral-400 dark:text-muted-foreground mb-6 text-center max-w-md">
                      Create some flashcards to start studying and testing your knowledge!
                    </p>
                    <CreateFlashcardDialog
                      onSave={handleCreateFlashcardSet}
                      trigger={
                        <Button className="bg-primary text-white font-bold hover:scale-105 transition-transform">
                          <Plus className="mr-2 h-5 w-5" /> Create Flashcards
                        </Button>
                      }
                    />
                  </div>
                )}

                {/* Hidden Dialog Trigger */}
                <div className="hidden">
                  <CreateFlashcardDialog
                    id={`add-flashcard-button-${set.id}`}
                    singleCard={true}
                    setId={set.id}
                    onAddCard={handleAddFlashcard}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Flashcards;
