
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Zap, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FlashcardItem {
  front: string;
  back: string;
}

interface CreateFlashcardDialogProps {
  onSave?: (setName: string, cards: FlashcardItem[]) => void;
  onAddCard?: (front: string, back: string) => void;
  trigger?: React.ReactNode;
  id?: string;
  singleCard?: boolean;
  setId?: string;
}

const CreateFlashcardDialog = ({ 
  onSave, 
  onAddCard,
  trigger, 
  id,
  singleCard = false,
  setId 
}: CreateFlashcardDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [setName, setSetName] = useState("");
  const [cards, setCards] = useState<FlashcardItem[]>([
    { front: "", back: "" }
  ]);
  const [singleCardData, setSingleCardData] = useState<FlashcardItem>({ front: "", back: "" });
  const { toast } = useToast();

  const handleAddCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot remove card",
        description: "A flashcard set must have at least one card",
        variant: "destructive"
      });
    }
  };

  const handleCardChange = (index: number, field: "front" | "back", value: string) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const handleSingleCardChange = (field: "front" | "back", value: string) => {
    setSingleCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (singleCard && onAddCard) {
      // Validate single card
      if (!singleCardData.front.trim() || !singleCardData.back.trim()) {
        toast({
          title: "Incomplete flashcard",
          description: "Please fill in both sides of the flashcard",
          variant: "destructive"
        });
        return;
      }
      
      // Add the single card
      onAddCard(singleCardData.front, singleCardData.back);
      
      // Reset form and close
      setSingleCardData({ front: "", back: "" });
      setIsOpen(false);
      return;
    }
    
    // Handle full set creation
    if (!setName.trim()) {
      toast({
        title: "Set name required",
        description: "Please enter a name for your flashcard set",
        variant: "destructive"
      });
      return;
    }

    // Check if any card is empty
    const emptyCards = cards.filter(card => !card.front.trim() || !card.back.trim());
    if (emptyCards.length > 0) {
      toast({
        title: "Incomplete flashcards",
        description: "Please fill in both sides of all flashcards",
        variant: "destructive"
      });
      return;
    }

    // Save the flashcards
    if (onSave) {
      onSave(setName, cards);
    }
    
    // Reset form
    setSetName("");
    setCards([{ front: "", back: "" }]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild id={id}>
        {trigger || (
          <Button className="spark-button-primary button-click-effect">
            <Plus className="mr-2 h-4 w-4" /> Create New Set
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-spark-primary" />
            {singleCard ? "Add New Flashcard" : "Create New Flashcard Set"}
          </DialogTitle>
          <DialogDescription>
            {singleCard 
              ? "Add a new flashcard to your set" 
              : "Create a set of flashcards to help you study"
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {!singleCard && (
            <div className="space-y-2">
              <Label htmlFor="setName">Set Name</Label>
              <Input
                id="setName"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder="e.g., Biology Terms"
                className="w-full"
              />
            </div>
          )}
          
          {singleCard ? (
            <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="single-front">Front (Question/Term)</Label>
                <Input
                  id="single-front"
                  value={singleCardData.front}
                  onChange={(e) => handleSingleCardChange("front", e.target.value)}
                  placeholder="Enter question or term"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="single-back">Back (Answer/Definition)</Label>
                <Textarea
                  id="single-back"
                  value={singleCardData.back}
                  onChange={(e) => handleSingleCardChange("back", e.target.value)}
                  placeholder="Enter answer or definition"
                  className="w-full min-h-[80px]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Flashcards</h4>
                <span className="text-sm text-muted-foreground">{cards.length} cards</span>
              </div>
              
              {cards.map((card, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Card {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleRemoveCard(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`front-${index}`}>Front</Label>
                    <Input
                      id={`front-${index}`}
                      value={card.front}
                      onChange={(e) => handleCardChange(index, "front", e.target.value)}
                      placeholder="Question or term"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`back-${index}`}>Back</Label>
                    <Textarea
                      id={`back-${index}`}
                      value={card.back}
                      onChange={(e) => handleCardChange(index, "back", e.target.value)}
                      placeholder="Answer or definition"
                      className="w-full min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={handleAddCard}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {singleCard ? "Add Flashcard" : "Create Flashcard Set"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFlashcardDialog;
