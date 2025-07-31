
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
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button
        className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-3 brutal-button brutal-button-glow brutal-border text-lg rounded-none shadow-[4px_4px_0px_#ff9800]"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-5 h-5 mr-2" />
        New Flashcard Set
      </Button>
    </DialogTrigger>
    <DialogContent className="bg-white brutal-border shadow-xl rounded-none p-0 max-w-lg font-mono">
      <div className="px-8 pt-8 pb-6">
        <DialogTitle className="text-3xl font-black text-black mb-2 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-orange-500" />
          Create Flashcard Set
        </DialogTitle>
        <DialogDescription className="text-gray-600 font-bold mb-6">
          Enter a set name and add your cards below. <br />
          <span className="text-orange-500">Brutalist. Fast. Fun.</span>
        </DialogDescription>
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block font-black mb-1 text-lg text-black">Set Name</label>
            <input
              type="text"
              value={setName}
              onChange={e => setSetName(e.target.value)}
              className="brutal-border w-full px-4 py-3 font-bold text-black bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
              placeholder="e.g. Biology Chapter 5"
              required
            />
          </div>

          <div>
            <label className="block font-black mb-1 text-lg text-black">Cards</label>
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 mb-2"
              >
                <input
                  type="text"
                  value={card.front}
                  onChange={e => handleCardChange(idx, "front", e.target.value)}
                  className="brutal-border px-3 py-2 font-bold text-black bg-white rounded-none w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Front (Question)"
                  required
                />
                <input
                  type="text"
                  value={card.back}
                  onChange={e => handleCardChange(idx, "back", e.target.value)}
                  className="brutal-border px-3 py-2 font-bold text-black bg-white rounded-none w-1/2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Back (Answer)"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="brutal-border bg-red-100 text-red-600 hover:bg-red-200 rounded-none ml-2"
                  onClick={() => removeCard(idx)}
                  aria-label="Remove card"
                >
                  <Minus className="w-5 h-5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addCard}
              className="bg-purple-500 hover:bg-purple-600 text-white font-black px-4 py-2 mt-2 brutal-button brutal-border rounded-none shadow-[2px_2px_0px_#a855f7]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Card
            </Button>
          </div>

          <div className="flex justify-between gap-4 mt-8">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-gray-200 text-black font-black px-6 py-3 brutal-button brutal-border rounded-none hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-3 brutal-button brutal-border brutal-button-glow rounded-none shadow-[4px_4px_0px_#ff9800]"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Create Set
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
  );
};

export default CreateFlashcardDialog;
