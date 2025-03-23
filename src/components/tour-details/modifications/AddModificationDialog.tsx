
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useModifications } from "@/hooks/modifications/useModifications";

interface AddModificationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tourId: string;
}

export const AddModificationDialog = ({ isOpen, setIsOpen, tourId }: AddModificationDialogProps) => {
  const [description, setDescription] = useState("");
  const { addModification, isAddingModification } = useModifications(tourId);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    
    await addModification({
      description,
      details: { type: 'manual', created_at: new Date().toISOString() }
    });
    
    setIsOpen(false);
    setDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Modification</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the modification..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={!description.trim() || isAddingModification}
          >
            {isAddingModification ? "Adding..." : "Add Modification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
