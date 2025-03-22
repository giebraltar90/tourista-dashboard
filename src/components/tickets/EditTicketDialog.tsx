
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Ticket {
  id: string;
  tourName: string;
  referenceCode: string;
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  guide1: string;
  guide2: string | null;
  guideType1: string;
  guideType2: string | null;
}

interface EditTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export const EditTicketDialog = ({ isOpen, onClose, ticket }: EditTicketDialogProps) => {
  const [adultTickets, setAdultTickets] = useState(ticket.adultTickets.toString());
  const [childTickets, setChildTickets] = useState(ticket.childTickets.toString());
  const [guide1Type, setGuide1Type] = useState(ticket.guideType1);
  const [guide2Type, setGuide2Type] = useState(ticket.guideType2 || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!adultTickets || !childTickets) {
      return;
    }

    setIsSaving(true);
    try {
      // In a real implementation, this would call an API to update the ticket
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Ticket updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ticket for {ticket.tourName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">Reference: #{ticket.referenceCode}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adultTickets">Adult Tickets</Label>
            <Input
              id="adultTickets"
              type="number"
              value={adultTickets}
              onChange={(e) => setAdultTickets(e.target.value)}
              min={0}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="childTickets">Child Tickets</Label>
            <Input
              id="childTickets"
              type="number"
              value={childTickets}
              onChange={(e) => setChildTickets(e.target.value)}
              min={0}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="guide1Type">Guide 1 Type</Label>
            <Select value={guide1Type} onValueChange={setGuide1Type}>
              <SelectTrigger id="guide1Type">
                <SelectValue placeholder="Select guide type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GA Ticket">GA Ticket</SelectItem>
                <SelectItem value="GA Free">GA Free</SelectItem>
                <SelectItem value="GC">GC</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Guide: {ticket.guide1}</p>
          </div>
          
          {ticket.guide2 && (
            <div className="space-y-2">
              <Label htmlFor="guide2Type">Guide 2 Type</Label>
              <Select value={guide2Type} onValueChange={setGuide2Type}>
                <SelectTrigger id="guide2Type">
                  <SelectValue placeholder="Select guide type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GA Ticket">GA Ticket</SelectItem>
                  <SelectItem value="GA Free">GA Free</SelectItem>
                  <SelectItem value="GC">GC</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Guide: {ticket.guide2}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!adultTickets || !childTickets || isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
