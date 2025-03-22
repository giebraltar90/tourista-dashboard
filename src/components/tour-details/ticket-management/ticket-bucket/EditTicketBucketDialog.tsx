
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketBucket } from "@/types/ticketBuckets";
import { useTicketBucketService } from "../services/ticketBucketService";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditTicketBucketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bucket: TicketBucket;
}

export const EditTicketBucketDialog = ({ isOpen, onClose, bucket }: EditTicketBucketDialogProps) => {
  const [referenceNumber, setReferenceNumber] = useState(bucket.reference_number);
  const [bucketType, setBucketType] = useState<'petit' | 'grande'>(bucket.bucket_type);
  const [maxTickets, setMaxTickets] = useState(bucket.max_tickets.toString());
  const [accessTime, setAccessTime] = useState(bucket.access_time || "");
  const [date, setDate] = useState<Date>(bucket.date);
  const [isSaving, setIsSaving] = useState(false);
  
  const { handleUpdateBucket } = useTicketBucketService();

  const handleSave = async () => {
    if (!referenceNumber || !bucketType || !maxTickets || !date) {
      return;
    }

    setIsSaving(true);
    try {
      const ticketsRange = bucketType === 'petit' ? '3-10' : '11-30';
      const success = await handleUpdateBucket(bucket.id, {
        reference_number: referenceNumber,
        bucket_type: bucketType,
        max_tickets: parseInt(maxTickets),
        tickets_range: ticketsRange,
        access_time: accessTime || null,
        date: date,
      });
      
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ticket Bucket</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., VER2304P"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  id="date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Bucket Type</Label>
            <Select 
              value={bucketType} 
              onValueChange={(value) => setBucketType(value as 'petit' | 'grande')}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select bucket type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="petit">Petit (3-10)</SelectItem>
                <SelectItem value="grande">Grande (11-30)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxTickets">Maximum Tickets</Label>
            <Input
              id="maxTickets"
              type="number"
              value={maxTickets}
              onChange={(e) => setMaxTickets(e.target.value)}
              min={1}
              max={30}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accessTime">Access Time (Optional)</Label>
            <Input
              id="accessTime"
              value={accessTime}
              onChange={(e) => setAccessTime(e.target.value)}
              placeholder="e.g., 10:30 AM"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!referenceNumber || !bucketType || !maxTickets || !date || isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
