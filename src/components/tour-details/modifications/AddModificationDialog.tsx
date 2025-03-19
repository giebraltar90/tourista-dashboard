
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useModifications } from "@/hooks/useModifications";

interface AddModificationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tourId: string;
}

export const AddModificationDialog = ({
  isOpen,
  setIsOpen,
  tourId
}: AddModificationDialogProps) => {
  const [description, setDescription] = useState("");
  const { addModification, isAddingModification } = useModifications(tourId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) return;
    
    const success = await addModification(description);
    if (success) {
      setDescription("");
      setIsOpen(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Modification</DialogTitle>
          <DialogDescription>
            Record a new modification or change to this tour
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Describe the modification..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isAddingModification}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isAddingModification || !description.trim()}
            >
              {isAddingModification ? "Saving..." : "Save Modification"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
