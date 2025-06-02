import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CreateFlashcardDialog from "@/components/features/CreateFlashcardDialog";

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

// ========== Your snippet as a new component ==========
function getFlashcards() {
  return JSON.parse(localStorage.getItem("flashcards") || "[]");
}

function SimpleFlashcards() {
  const [cards, setCards] = useState<{ q: string; a: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setCards(getFlashcards());
  }, []);

  if (!cards.length) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-xl font-bold mb-4">No flashcards found.</h2>
        <a href="/notes" className="underline text-violet-500">
          Generate flashcards →
        </a>
      </div>
    );
  }

  function next() {
    setIdx((i) => (i + 1) % cards.length);
    setFlipped(false);
  }
  function prev() {
    setIdx((i) => (i - 1 + cards.length) % cards.length);
    setFlipped(false);
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Flashcards</h2>
      <div
        className={`relative w-full max-w-md h-56 mb-8 cursor-pointer transition-transform duration-500 perspective`}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className={`absolute w-full h-full rounded-xl shadow-lg bg-neutral-900 dark:bg-zinc-200 text-white dark:text-black flex items-center justify-center text-xl font-semibold p-6 transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            minHeight: "13rem",
          }}
        >
          {!flipped ? cards[idx]?.q : cards[idx]?.a}
        </div>
      </div>
      <div className="flex gap-6">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-violet-700 transition"
          onClick={prev}
        >
          Prev
        </button>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-violet-700 transition"
          onClick={next}
        >
          Next
        </button>
      </div>
      <div className="mt-4 text-xs text-gray-400">
        {idx + 1} / {cards.length}
      </div>
    </div>
  );
}
// ========== End snippet ==========

const Flashcards = () => {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [activeSet, setActiveSet] = useState("biology");
  const { toast } = useToast();

  const [flashcardSets, setFlashcardSets] = useState<Record<string, FlashcardItem[]>>({
    biology: [
      {
        id: 1,
        front: "What is photosynthesis?",
        back: "The process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water.",
      },
      {
        id: 2,
        front: "Define osmosis",
        back: "The process of water molecules moving from an area of higher concentration to an area of lower concentration through a semi-permeable membrane.",
      },
      {
        id: 3,
        front: "What are mitochondria?",
        back: "Organelles that generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
      },
    ],
    chemistry: [
      {
        id: 4,
        front: "What is the periodic table?",
        back: "A tabular arrangement of chemical elements organized by atomic number, electron configuration, and recurring chemical properties.",
      },
      {
        id: 5,
        front: "Define pH",
        back: "A logarithmic scale used to specify the acidity or basicity of an aqueous solution.",
      },
      {
        id: 6,
        front: "What is an isotope?",
        back: "Variants of a particular chemical element which differ in neutron number but have the same number of protons.",
      },
    ],
    history: [
      {
        id: 7,
        front: "When did World War II begin?",
        back: "September 1, 1939, with Nazi Germany's invasion of Poland.",
      },
      {
        id: 8,
        front: "Who was the first President of the United States?",
        back: "George Washington, who served from 1789 to 1797.",
      },
      {
        id: 9,
        front: "What was the Renaissance?",
        back: "A period in European history marking the transition from the Middle Ages to modernity, characterized by an emphasis on learning, art, and culture.",
      },
    ],
  });

  const [setNames, setSetNames] = useState([
    { id: "biology", name: "Biology" },
    { id: "chemistry", name: "Chemistry" },
    { id: "history", name: "History" },
  ]);

  const toggleFlip = (id: number) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddNewFlashcard = (setId: string) => {
    const dialogTrigger = document.getElementById(`add-flashcard-button-${setId}`);
    if (dialogTrigger) {
      dialogTrigger.click();
    }
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
    const cardsWithIds = cards.map((card, index) => ({
      ...card,
      id: Math.max(0, ...Object.values(flashcardSets).flat().map((c) => c.id)) + index + 1,
    }));
    setFlashcardSets((prev) => ({
      ...prev,
      [setId]: cardsWithIds,
    }));
    setSetNames((prev) => [...prev, { id: setId, name: setName }]);
    setActiveSet(setId);
    toast({
      title: "Flashcard set created",
      description: `Successfully created "${setName}" with ${cards.length} cards.`,
    });
  };

  const handleAddFlashcard = (front: string, back: string) => {
    const newCard = {
      id: Math.max(0, ...Object.values(flashcardSets).flat().map((c) => c.id)) + 1,
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

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">

          {/* You can move this <SimpleFlashcards /> wherever you want */}
          <div className="mb-12">
            <SimpleFlashcards />
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Flashcards</h1>
              <p className="text-muted-foreground">
                Master key concepts and definitions with AI-generated flashcards
              </p>
            </div>
            <CreateFlashcardDialog onSave={handleCreateFlashcardSet} />
          </div>

          <Tabs value={activeSet} onValueChange={setActiveSet} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              {setNames.map((set) => (
                <TabsTrigger key={set.id} value={set.id} className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>{set.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(flashcardSets).map(([key, cards]) => (
              <TabsContent key={key} value={key} className="mt-0">
                {cards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                      <div key={card.id} className="perspective-1000 h-64" onClick={() => toggleFlip(card.id)}>
                        <Card
                          className={`h-full w-full cursor-pointer transition-all duration-500 relative ${
                            flipped[card.id] ? "rotate-y-180" : ""
                          }`}
                          style={{
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-md bg-muted dark:bg-muted"
                            style={{
                              backfaceVisibility: "hidden",
                            }}
                          >
                            <h3 className="text-xl font-semibold text-center mb-4 text-foreground">{card.front}</h3>
                            <p className="text-sm text-muted-foreground text-center">Click to flip</p>
                          </div>
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-md bg-primary text-white"
                            style={{
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
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

                {/* Hidden trigger button for the dialog */}
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
