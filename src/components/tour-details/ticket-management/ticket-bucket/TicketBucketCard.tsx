
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Ticket, Trash2 } from "lucide-react";
import { TicketBucket } from "@/types/ticketBuckets";
import { useState, useEffect } from "react";
import { format, isValid } from "date-fns";
import { EditTicketBucketDialog } from "./EditTicketBucketDialog";

interface TicketBucketCardProps {
  bucket: TicketBucket;
  onRemove: (bucketId: string) => Promise<boolean>;
  tourId: string;
  requiredTickets: number;
}

export const TicketBucketCard = ({ bucket, onRemove, tourId, requiredTickets }: TicketBucketCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Check if this bucket is assigned to the current tour
  const isBucketAssignedToThisTour = bucket.tour_id === tourId;
  
  // Calculate available tickets, accounting for current tour requirements if assigned
  let availableTickets = 0;
  
  if (isBucketAssignedToThisTour) {
    // If bucket is assigned to this tour, the tickets are already accounted for
    // We should display the tickets that are available AFTER this tour's allocation
    availableTickets = bucket.max_tickets - bucket.allocated_tickets;
  } else {
    // If not assigned to this tour, just show the regular availability
    availableTickets = bucket.max_tickets - bucket.allocated_tickets;
  }
  
  // Ensure we don't show negative available tickets
  availableTickets = Math.max(0, availableTickets);
  
  // Split required tickets into participants and guides
  // This assumes that if the total required is 8 and we know 2 are for guides,
  // then 6 must be for participants
  const participantTickets = requiredTickets - (bucket.guide_tickets || 0);
  const guideTickets = bucket.guide_tickets || 0;
  
  // Format the requirements for display
  let formattedRequirements = '';
  if (guideTickets > 0) {
    formattedRequirements = `${participantTickets} + ${guideTickets}`;
  } else {
    formattedRequirements = `${requiredTickets}`;
  }
  
  // Log bucket information for debugging
  useEffect(() => {
    console.log("🎫 [TicketBucketCard] Rendering bucket:", {
      id: bucket.id,
      reference: bucket.reference_number,
      maxTickets: bucket.max_tickets,
      allocatedTickets: bucket.allocated_tickets,
      effectiveAllocated: isBucketAssignedToThisTour ? bucket.allocated_tickets : bucket.allocated_tickets,
      availableTickets,
      isBucketAssignedToThisTour,
      tourId,
      bucketTourId: bucket.tour_id,
      requiredTickets,
      participantTickets,
      guideTickets
    });
  }, [bucket, availableTickets, isBucketAssignedToThisTour, tourId, requiredTickets]);
  
  // Safely format date for display
  let dateToUse;
  let formattedDate = "Invalid Date";
  
  try {
    if (bucket.date instanceof Date) {
      dateToUse = bucket.date;
    } else if (typeof bucket.date === 'string') {
      dateToUse = new Date(bucket.date);
    } else if (bucket.date) {
      // Handle any other type by converting to string first
      dateToUse = new Date(String(bucket.date));
    } else {
      dateToUse = new Date(); // Fallback
    }
    
    if (isValid(dateToUse)) {
      formattedDate = format(dateToUse, "MMM d, yyyy");
    } else {
      formattedDate = "Date unavailable";
    }
  } catch (e) {
    console.error("Error formatting date:", e);
    formattedDate = "Error with date";
  }

  return (
    <>
      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-4 pb-0">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium text-sm">{bucket.reference_number}</h4>
              <p className="text-xs text-muted-foreground">
                {bucket.bucket_type === 'petit' ? 'Petit' : 'Grande'} | {formattedDate}
              </p>
            </div>
            <div className="flex items-center text-sm space-x-1">
              <Ticket className="h-4 w-4 text-indigo-500" />
              <span>
                <span className={availableTickets === 0 ? "text-destructive" : "text-primary"}>
                  {availableTickets}
                </span>
                /{bucket.max_tickets}
              </span>
            </div>
          </div>
          
          <div className="text-xs flex items-center mb-2">
            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">
              {bucket.access_time || "No specified time"}
            </span>
          </div>
          
          {isBucketAssignedToThisTour && (
            <div className="text-xs bg-blue-50 text-blue-800 p-2 rounded-md mb-2">
              <span className="font-medium">Tour allocation:</span>{' '}
              {guideTickets > 0 
                ? `${participantTickets} + ${guideTickets} tickets assigned to this tour${guideTickets > 0 ? ` (${guideTickets} for guides)` : ''}`
                : `${requiredTickets} ticket${requiredTickets !== 1 ? 's' : ''} assigned to this tour`
              }
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-2 flex justify-between bg-secondary/20">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive hover:text-destructive"
            onClick={() => onRemove(bucket.id)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </CardFooter>
      </Card>
      
      {isEditDialogOpen && (
        <EditTicketBucketDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          bucket={bucket}
        />
      )}
    </>
  );
};
