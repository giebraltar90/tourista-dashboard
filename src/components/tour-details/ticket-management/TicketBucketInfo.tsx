
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketBucket } from "@/types/ticketBuckets";
import { TicketBucketHeader } from "./ticket-bucket/TicketBucketHeader";
import { TicketBucketEmpty } from "./ticket-bucket/TicketBucketEmpty";
import { TicketBucketList } from "./ticket-bucket/TicketBucketList";
import { TicketBucketFooter } from "./ticket-bucket/TicketBucketFooter";
import { AssignBucketDialog } from "./AssignBucketDialog";
import { useTicketAssignmentService } from "./services/ticketAssignmentService";

interface TicketBucketInfoProps {
  buckets: TicketBucket[];
  isLoading: boolean;
  tourId: string;
  requiredTickets: number;
  tourDate: Date;
  totalParticipants: number;
  guideTicketsNeeded?: number;
}

export const TicketBucketInfo = ({ 
  buckets, 
  isLoading, 
  tourId, 
  requiredTickets, 
  tourDate,
  totalParticipants,
  guideTicketsNeeded = 0
}: TicketBucketInfoProps) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { handleRemoveBucket } = useTicketAssignmentService();

  // Safely ensure buckets array is valid
  const validBuckets = Array.isArray(buckets) ? buckets : [];

  // Find if any bucket is assigned to this tour
  const bucketAssignedToTour = validBuckets.find(bucket => bucket.tour_id === tourId);
  
  // Calculate the total available tickets across all buckets
  const totalBucketTickets = validBuckets.reduce((sum, bucket) => {
    let availableTickets = 0;
    
    if (bucket.tour_id === tourId) {
      // For buckets assigned to this tour, we consider their full capacity
      availableTickets = bucket.max_tickets;
    } else {
      // For other buckets, just show normal availability
      availableTickets = Math.max(0, bucket.max_tickets - bucket.allocated_tickets);
    }
    
    return sum + availableTickets;
  }, 0);

  // Log calculations for debugging
  useEffect(() => {
    console.log("🎫 [TicketBucketInfo] Calculated tickets:", {
      totalBucketTickets,
      requiredTickets,
      totalParticipants,
      guideTicketsNeeded,
      totalTicketsNeeded: totalParticipants + guideTicketsNeeded,
      bucketCount: validBuckets.length,
      bucketAssignedToTour: bucketAssignedToTour ? {
        id: bucketAssignedToTour.id,
        ref: bucketAssignedToTour.reference_number,
        maxTickets: bucketAssignedToTour.max_tickets,
        allocatedTickets: bucketAssignedToTour.allocated_tickets
      } : null
    });
  }, [validBuckets, requiredTickets, totalParticipants, bucketAssignedToTour, tourId, guideTicketsNeeded]);

  // We have enough tickets if a bucket is assigned to this tour
  const hasEnoughBucketTickets = !!bucketAssignedToTour;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Ticket Buckets</h3>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (validBuckets.length === 0) {
    return (
      <TicketBucketEmpty 
        onAssignBucket={() => setIsAssignDialogOpen(true)} 
        isAssignDialogOpen={isAssignDialogOpen} 
        onCloseDialog={() => setIsAssignDialogOpen(false)} 
        tourId={tourId}
        tourDate={tourDate}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TicketBucketHeader 
        onAssignBucket={() => setIsAssignDialogOpen(true)} 
      />

      <TicketBucketList 
        buckets={validBuckets} 
        onRemoveBucket={(bucketId) => handleRemoveBucket(bucketId, tourId)} 
        tourId={tourId}
        requiredTickets={requiredTickets}
      />

      <TicketBucketFooter 
        totalBucketTickets={totalBucketTickets} 
        requiredTickets={requiredTickets} 
        hasEnoughBucketTickets={hasEnoughBucketTickets} 
      />
      
      {isAssignDialogOpen && (
        <AssignBucketDialog 
          isOpen={isAssignDialogOpen} 
          onClose={() => setIsAssignDialogOpen(false)} 
          tourId={tourId}
          tourDate={tourDate}
        />
      )}
    </div>
  );
};
