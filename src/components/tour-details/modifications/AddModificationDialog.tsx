
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModifications } from "@/hooks/modifications/useModifications";

interface AddModificationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tourId: string;
}

export const AddModificationDialog = ({ isOpen, setIsOpen, tourId }: AddModificationDialogProps) => {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const { addModification, isAddingModification } = useModifications(tourId);

  const handleSubmit = async () => {
    if (!description) return;
    
    try {
      addModification({
        description,
        details: { 
          source: "user_input",
          status: status // Include status inside details instead
        }
      });
      
      setDescription("");
      setStatus("pending");
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding modification:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Tour Modification</DialogTitle>
          <DialogDescription>
            Record a modification or change to this tour's details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Modification Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the modification in detail..."
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!description || isAddingModification}
          >
            {isAddingModification ? "Saving..." : "Save Modification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
