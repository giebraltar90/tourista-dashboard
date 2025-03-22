
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
  const isBucketAssignedToThisTour = bucket.assigned_tours?.includes(tourId) || false;
  
  // Find the allocation for this specific tour
  const tourAllocation = bucket.tour_allocations?.find(
    allocation => allocation.tour_id === tourId
  );
  const ticketsAllocatedToThisTour = tourAllocation?.tickets_required || 0;
  
  // Calculate tickets allocated to other tours
  const ticketsAllocatedToOtherTours = 
    (bucket.allocated_tickets || 0) - (isBucketAssignedToThisTour ? ticketsAllocatedToThisTour : 0);
  
  // Available tickets after accounting for allocations to other tours
  const availableTicketsForOtherTours = (bucket.max_tickets || 0) - ticketsAllocatedToOtherTours;
  
  // For display purposes
  const displayAvailableTickets = isBucketAssignedToThisTour 
    ? availableTicketsForOtherTours 
    : ((bucket.max_tickets || 0) - (bucket.allocated_tickets || 0));
  
  // Split required tickets into participants and guides
  const guideTickets = bucket.guide_tickets || 0;
  const participantTickets = requiredTickets - guideTickets;
  
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
      isBucketAssignedToThisTour,
      ticketsAllocatedToThisTour,
      ticketsAllocatedToOtherTours,
      availableTicketsForOtherTours,
      displayAvailableTickets,
      tourId,
      requiredTickets,
      participantTickets,
      guideTickets
    });
  }, [bucket, isBucketAssignedToThisTour, tourId, requiredTickets, ticketsAllocatedToThisTour, ticketsAllocatedToOtherTours, availableTicketsForOtherTours, displayAvailableTickets]);
  
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
                <span className={displayAvailableTickets <= 0 ? "text-destructive" : "text-primary"}>
                  {displayAvailableTickets}
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
