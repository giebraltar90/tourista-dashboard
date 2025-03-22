
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchTicketBucketsByDate } from "@/services/api/ticketBucketService";
import { format } from "date-fns";
import { useTicketAssignmentService } from "./services/ticketAssignmentService";

interface AssignBucketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
  tourDate: Date;
}

export const AssignBucketDialog = ({ isOpen, onClose, tourId, tourDate }: AssignBucketDialogProps) => {
  const [selectedBucketId, setSelectedBucketId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const { handleAssignBucket } = useTicketAssignmentService();
  
  // Format the date for display
  const formattedDate = format(tourDate, 'yyyy-MM-dd');
  console.log("Fetching buckets for date:", formattedDate, tourDate);

  // Fetch buckets for the tour date
  const { data: availableBuckets = [], isLoading } = useQuery({
    queryKey: ['availableBuckets', formattedDate],
    queryFn: () => fetchTicketBucketsByDate(tourDate),
    enabled: isOpen,
  });
  
  // Log the available buckets for debugging
  useEffect(() => {
    console.log("Available buckets loaded:", availableBuckets);
  }, [availableBuckets]);

  // Filter out buckets that are already assigned to any tour
  const unassignedBuckets = availableBuckets.filter(bucket => !bucket.tour_id);
  
  // Log the filtered unassigned buckets
  useEffect(() => {
    console.log("Unassigned buckets:", unassignedBuckets);
  }, [unassignedBuckets]);

  const handleAssignBucketClick = async () => {
    if (!selectedBucketId) {
      return;
    }

    setIsAssigning(true);
    try {
      const success = await handleAssignBucket(selectedBucketId, tourId);
      if (success) {
        onClose();
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Ticket Bucket</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bucket">Select a ticket bucket for {format(tourDate, 'MMM d, yyyy')}</Label>
            <Select
              value={selectedBucketId}
              onValueChange={setSelectedBucketId}
              disabled={isLoading}
            >
              <SelectTrigger id="bucket" className="w-full">
                <SelectValue placeholder="Select a ticket bucket" />
              </SelectTrigger>
              <SelectContent>
                {unassignedBuckets.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No unassigned buckets available for this date
                  </SelectItem>
                ) : (
                  unassignedBuckets.map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.id}>
                      {bucket.reference_number} - {bucket.bucket_type} - {bucket.max_tickets - bucket.allocated_tickets} available
                      {bucket.access_time && ` - ${bucket.access_time}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleAssignBucketClick} 
            disabled={!selectedBucketId || isAssigning}
          >
            {isAssigning ? "Assigning..." : "Assign Bucket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
