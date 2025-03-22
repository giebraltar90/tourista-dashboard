
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
  
  // Ensure the date has the correct time (noon) to avoid timezone issues
  const displayDate = new Date(tourDate);
  displayDate.setHours(12, 0, 0, 0);
  
  // Format the date for display and API query
  const formattedDate = format(displayDate, 'yyyy-MM-dd');
  
  console.log("🔍 [AssignBucketDialog] Dialog opened with date:", {
    originalTourDate: tourDate.toISOString(),
    displayDate: displayDate.toISOString(),
    formattedDate,
    dateComponents: {
      year: displayDate.getFullYear(),
      month: displayDate.getMonth() + 1,
      day: displayDate.getDate(),
      fullDate: displayDate.toDateString()
    }
  });

  // Fetch buckets for the tour date
  const { data: availableBuckets = [], isLoading } = useQuery({
    queryKey: ['availableBuckets', formattedDate],
    queryFn: () => {
      console.log("🔍 [AssignBucketDialog] Fetching buckets for date:", displayDate.toISOString());
      return fetchTicketBucketsByDate(displayDate);
    },
    enabled: isOpen,
  });
  
  // Log the available buckets for debugging
  useEffect(() => {
    console.log("🔍 [AssignBucketDialog] Available buckets loaded:", 
      availableBuckets.map(b => ({
        id: b.id,
        reference: b.reference_number,
        date: b.date.toISOString(),
        dateComponents: {
          year: b.date.getFullYear(),
          month: b.date.getMonth() + 1,
          day: b.date.getDate(),
          fullDate: b.date.toDateString()
        }
      }))
    );
  }, [availableBuckets]);

  // Filter out buckets that are already assigned to any tour
  const unassignedBuckets = availableBuckets.filter(bucket => !bucket.tour_id);
  
  // Log the filtered unassigned buckets
  useEffect(() => {
    console.log("🔍 [AssignBucketDialog] Unassigned buckets:", 
      unassignedBuckets.map(b => ({
        id: b.id,
        reference: b.reference_number,
        date: b.date.toISOString()
      }))
    );
  }, [unassignedBuckets]);

  const handleAssignBucketClick = async () => {
    if (!selectedBucketId) {
      return;
    }

    console.log("🔍 [AssignBucketDialog] Assigning bucket:", {
      bucketId: selectedBucketId,
      tourId,
      selectedBucket: unassignedBuckets.find(b => b.id === selectedBucketId)
    });

    setIsAssigning(true);
    try {
      const success = await handleAssignBucket(selectedBucketId, tourId);
      console.log("🔍 [AssignBucketDialog] Assignment result:", success);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("🔴 [AssignBucketDialog] Assignment error:", error);
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
            <Label htmlFor="bucket">Select a ticket bucket for {format(displayDate, 'MMM d, yyyy')}</Label>
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
