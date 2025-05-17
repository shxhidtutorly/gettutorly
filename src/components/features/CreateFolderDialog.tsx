
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Folder, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CreateFolderDialogProps {
  onFolderCreate: (folderData: { name: string; description: string }) => void;
  trigger?: React.ReactNode;
  buttonSize?: "sm" | "default";
}

const CreateFolderDialog = ({ 
  onFolderCreate, 
  trigger, 
  buttonSize = "default" 
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for your folder",
        variant: "destructive",
      });
      return;
    }
    
    onFolderCreate({
      name: folderName.trim(),
      description: folderDescription.trim()
    });
    
    // Reset form and close dialog
    setFolderName("");
    setFolderDescription("");
    setIsOpen(false);
    
    toast({
      title: "Folder created",
      description: `"${folderName}" folder has been created successfully`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size={buttonSize} className="animated-button">
            <Plus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-spark-primary" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            Organize your study materials by creating folders
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="folderName" className="text-sm font-medium">
              Folder Name
            </Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Biology 101"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folderDescription" className="text-sm font-medium">
              Description (optional)
            </Label>
            <Textarea
              id="folderDescription"
              value={folderDescription}
              onChange={(e) => setFolderDescription(e.target.value)}
              placeholder="Add a brief description of this folder's contents"
              className="w-full min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Folder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
