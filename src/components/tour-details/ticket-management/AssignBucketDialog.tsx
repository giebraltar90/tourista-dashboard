
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchTicketBucketsByDate } from "@/services/api/ticketBucketService";
import { assignBucketToTour } from "@/services/api/tourTicketService";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface AssignBucketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
  tourDate: Date;
}

export const AssignBucketDialog = ({ isOpen, onClose, tourId, tourDate }: AssignBucketDialogProps) => {
  const [selectedBucketId, setSelectedBucketId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const queryClient = useQueryClient();

  // Fetch buckets for the tour date
  const { data: availableBuckets = [], isLoading } = useQuery({
    queryKey: ['availableBuckets', format(tourDate, 'yyyy-MM-dd')],
    queryFn: () => fetchTicketBucketsByDate(tourDate),
    enabled: isOpen,
  });

  // Filter out buckets that are already assigned to any tour
  const unassignedBuckets = availableBuckets.filter(bucket => !bucket.tour_id);

  const handleAssignBucket = async () => {
    if (!selectedBucketId) {
      toast.error("Please select a ticket bucket to assign");
      return;
    }

    setIsAssigning(true);
    try {
      await assignBucketToTour(selectedBucketId, tourId);
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['ticketBuckets', tourId] });
      queryClient.invalidateQueries({ queryKey: ['availableBuckets'] });
      
      toast.success("Ticket bucket assigned successfully");
      onClose();
    } catch (error) {
      console.error("Error assigning bucket:", error);
      toast.error("Failed to assign ticket bucket");
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
            onClick={handleAssignBucket} 
            disabled={!selectedBucketId || isAssigning}
          >
            {isAssigning ? "Assigning..." : "Assign Bucket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
