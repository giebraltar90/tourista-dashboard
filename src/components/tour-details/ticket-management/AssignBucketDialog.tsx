
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  requiredTickets?: number;
}

export const AssignBucketDialog = ({ 
  isOpen, 
  onClose, 
  tourId, 
  tourDate,
  requiredTickets = 0 
}: AssignBucketDialogProps) => {
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
    tourId,
    requiredTickets,
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
        maxTickets: b.max_tickets,
        allocatedTickets: b.allocated_tickets || 0,
        assignedTours: b.assigned_tours?.length || 0,
        availableTickets: b.max_tickets - (b.allocated_tickets || 0),
        dateComponents: {
          year: b.date.getFullYear(),
          month: b.date.getMonth() + 1,
          day: b.date.getDate(),
          fullDate: b.date.toDateString()
        }
      }))
    );
  }, [availableBuckets]);

  // Filter buckets that can accommodate this tour's tickets
  // Fixed filtering logic to prevent UI freeze
  const availableBucketsForTour = availableBuckets.filter(bucket => {
    // Skip filtering if no tickets are needed - all buckets are valid
    if (requiredTickets <= 0) {
      // Don't show buckets that already have this tour assigned
      return !(bucket.assigned_tours && bucket.assigned_tours.includes(tourId));
    }
    
    // Calculate available tickets more safely
    const allocatedTickets = typeof bucket.allocated_tickets === 'number' 
      ? bucket.allocated_tickets 
      : 0;
    
    const remainingTickets = bucket.max_tickets - allocatedTickets;
    
    // Check if this tour isn't already assigned to this bucket
    const tourIsAlreadyAssigned = bucket.assigned_tours && bucket.assigned_tours.includes(tourId);
    
    // Return true if there are enough remaining tickets and tour isn't already assigned
    return remainingTickets >= requiredTickets && !tourIsAlreadyAssigned;
  });
  
  // Log the filtered buckets
  useEffect(() => {
    console.log("🔍 [AssignBucketDialog] Filtered buckets with enough capacity:", 
      availableBucketsForTour.map(b => ({
        id: b.id,
        reference: b.reference_number,
        maxTickets: b.max_tickets,
        totalAllocated: b.allocated_tickets || 0,
        requiredTickets,
        available: b.max_tickets - (b.allocated_tickets || 0)
      }))
    );
  }, [availableBucketsForTour, requiredTickets]);

  const handleAssignBucketClick = async () => {
    if (!selectedBucketId) {
      return;
    }

    console.log("🔍 [AssignBucketDialog] Assigning bucket:", {
      bucketId: selectedBucketId,
      tourId,
      requiredTickets,
      selectedBucket: availableBuckets.find(b => b.id === selectedBucketId)
    });

    setIsAssigning(true);
    try {
      const success = await handleAssignBucket(selectedBucketId, tourId, requiredTickets);
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

  // Reset selected bucket when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBucketId("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Ticket Bucket</DialogTitle>
          <DialogDescription>
            Select a ticket bucket for this tour on {format(displayDate, 'MMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bucket">Select a ticket bucket</Label>
            <Select
              value={selectedBucketId}
              onValueChange={setSelectedBucketId}
              disabled={isLoading}
            >
              <SelectTrigger id="bucket" className="w-full">
                <SelectValue placeholder="Select a ticket bucket" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading buckets...
                  </SelectItem>
                ) : availableBucketsForTour.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No buckets available for this tour
                  </SelectItem>
                ) : (
                  availableBucketsForTour.map((bucket) => {
                    // Calculate remaining capacity
                    const allocatedTotal = typeof bucket.allocated_tickets === 'number' 
                      ? bucket.allocated_tickets 
                      : 0;
                    
                    const remainingCapacity = bucket.max_tickets - allocatedTotal;
                    
                    return (
                      <SelectItem key={bucket.id} value={bucket.id}>
                        {bucket.reference_number} - {bucket.bucket_type} - {remainingCapacity}/{bucket.max_tickets} available
                        {bucket.access_time && ` - ${bucket.access_time}`}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            This tour needs {requiredTickets} tickets
            {requiredTickets > 0 && <span className="text-xs ml-1">(including guide tickets if required)</span>}
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
