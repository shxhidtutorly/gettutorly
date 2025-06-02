import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, BookOpen, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CreateFlashcardDialog from "@/components/features/CreateFlashcardDialog";
import { Flashcard } from "@/lib/aiNotesService";

interface FlashcardItem {
  id: number;
  front: string;
  back: string;
}

interface FlashcardSet {
  id: string;
  name: string;
  cards: FlashcardItem[];
}

const Flashcards = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [activeSet, setActiveSet] = useState("ai-generated");
  const [aiFlashcards, setAiFlashcards] = useState<Flashcard[]>([]);
  const [aiSource, setAiSource] = useState<string>('');
  const { toast } = useToast();
  
  // Load AI-generated flashcards from localStorage
  useEffect(() => {
    const savedFlashcards = localStorage.getItem('flashcards');
    const savedSource = localStorage.getItem('flashcards-source');
    
    if (savedFlashcards) {
      try {
        const flashcards = JSON.parse(savedFlashcards);
        setAiFlashcards(flashcards);
        setAiSource(savedSource || 'AI Generated');
      } catch (error) {
        console.error('Error parsing saved flashcards:', error);
      }
    }
  }, []);
  
  const toggleFlip = (id: string) => {
    setFlipped(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddNewFlashcard = (setId: string) => {
    const dialogTrigger = document.getElementById(`add-flashcard-button-${setId}`);
    if (dialogTrigger) {
      dialogTrigger.click();
    }
  };
  
  const handleCreateFlashcardSet = (setName: string, cards: { front: string, back: string }[]) => {
    const setId = setName.toLowerCase().replace(/\s+/g, '-');
    
    if (flashcardSets[setId]) {
      toast({
        title: "Set already exists",
        description: "A flashcard set with this name already exists. Please choose a different name.",
        variant: "destructive"
      });
      return;
    }
    
    const cardsWithIds = cards.map((card, index) => ({
      ...card,
      id: Math.max(0, ...Object.values(flashcardSets).flat().map(c => c.id)) + index + 1
    }));
    
    setFlashcardSets(prev => ({
      ...prev,
      [setId]: cardsWithIds
    }));
    
    setSetNames(prev => [
      ...prev,
      { id: setId, name: setName }
    ]);
    
    setActiveSet(setId);
    
    toast({
      title: "Flashcard set created",
      description: `Successfully created "${setName}" with ${cards.length} cards.`
    });
  };

  const handleAddFlashcard = (front: string, back: string) => {
    const newCard = {
      id: Math.max(0, ...Object.values(flashcardSets).flat().map(c => c.id)) + 1,
      front,
      back
    };

    setFlashcardSets(prev => ({
      ...prev,
      [activeSet]: [...(prev[activeSet] || []), newCard]
    }));

    toast({
      title: "Flashcard added",
      description: "Successfully added new flashcard to the set."
    });
  };

  const clearAIFlashcards = () => {
    localStorage.removeItem('flashcards');
    localStorage.removeItem('flashcards-source');
    setAiFlashcards([]);
    setAiSource('');
    setActiveSet("biology");
    toast({
      title: "AI flashcards cleared",
      description: "All AI-generated flashcards have been removed."
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Flashcards</h1>
              <p className="text-muted-foreground">Master key concepts with AI-generated and custom flashcards</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a href="/ai-notes" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Notes
                </a>
              </Button>
              <CreateFlashcardDialog onSave={handleCreateFlashcardSet} />
            </div>
          </div>
          
          <Tabs value={activeSet} onValueChange={setActiveSet} className="w-full">
            <TabsList className={`grid mb-8 ${aiFlashcards.length > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {aiFlashcards.length > 0 && (
                <TabsTrigger value="ai-generated" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Generated</span>
                  <Badge variant="secondary" className="ml-1">{aiFlashcards.length}</Badge>
                </TabsTrigger>
              )}
              {setNames.map(set => (
                <TabsTrigger key={set.id} value={set.id} className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">{set.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {aiFlashcards.length > 0 && (
              <TabsContent value="ai-generated" className="mt-0">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">AI Generated Flashcards</h3>
                    <p className="text-sm text-muted-foreground">From: {aiSource}</p>
                  </div>
                  <Button onClick={clearAIFlashcards} variant="outline" size="sm">
                    Clear AI Cards
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiFlashcards.map((card) => (
                    <div 
                      key={card.id} 
                      className="perspective-1000 h-64"
                      onClick={() => toggleFlip(card.id)}
                    >
                      <Card 
                        className={`h-full w-full cursor-pointer transition-all duration-500 relative ${
                          flipped[card.id] ? 'rotate-y-180' : ''
                        }`}
                        style={{
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        <div 
                          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-md bg-muted dark:bg-muted"
                          style={{
                            backfaceVisibility: 'hidden'
                          }}
                        >
                          <h3 className="text-lg font-semibold text-center mb-4 text-foreground">{card.question}</h3>
                          <p className="text-sm text-muted-foreground text-center">Click to flip</p>
                        </div>
                        <div 
                          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-md bg-primary text-white"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <p className="text-center overflow-auto max-h-full text-white text-sm leading-relaxed">{card.answer}</p>
                          <p className="text-xs opacity-70 text-center mt-4 text-white">Click to flip back</p>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
            
            {Object.entries(flashcardSets).map(([key, cards]) => (
              <TabsContent key={key} value={key} className="mt-0">
                {cards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                      <div 
                        key={card.id} 
                        className="perspective-1000 h-64"
                        onClick={() => toggleFlip(card.id.toString())}
                      >
                        <Card 
                          className={`h-full w-full cursor-pointer transition-all duration-500 relative ${
                            flipped[card.id.toString()] ? 'rotate-y-180' : ''
                          }`}
                          style={{
                            transformStyle: 'preserve-3d'
                          }}
                        >
                          <div 
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-md bg-muted dark:bg-muted"
                            style={{
                              backfaceVisibility: 'hidden'
                            }}
                          >
                            <h3 className="text-xl font-semibold text-center mb-4 text-foreground">{card.front}</h3>
                            <p className="text-sm text-muted-foreground text-center">Click to flip</p>
                          </div>
                          <div 
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-md bg-primary text-white"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            <p className="text-center overflow-auto max-h-full text-white">{card.back}</p>
                            <p className="text-sm opacity-70 text-center mt-4 text-white">Click to flip back</p>
                          </div>
                        </Card>
                      </div>
                    ))}
                    
                    <div 
                      id={`add-flashcard-container-${key}`}
                      className="flex items-center justify-center h-64"
                      onClick={() => handleAddNewFlashcard(key)}
                    >
                      <Card className="h-full w-full border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors">
                        <Plus className="h-8 w-8 text-primary mb-2" />
                        <p className="text-center font-medium">Add New Flashcard</p>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-muted rounded-full p-4 mb-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No flashcards yet</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Create some flashcards to start studying and testing your knowledge
                    </p>
                    <CreateFlashcardDialog 
                      onSave={handleCreateFlashcardSet}
                      trigger={
                        <Button className="bg-primary text-white button-click-effect">
                          <Plus className="mr-2 h-4 w-4" /> Create Flashcards
                        </Button>
                      }
                    />
                  </div>
                )}

                <div className="hidden">
                  <CreateFlashcardDialog
                    id={`add-flashcard-button-${key}`}
                    singleCard={true}
                    setId={key}
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
