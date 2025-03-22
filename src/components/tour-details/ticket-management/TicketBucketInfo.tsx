
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

  // Find bucket that is assigned to this specific tour
  const bucketAssignedToTour = validBuckets.find(bucket => 
    bucket.assigned_tours && bucket.assigned_tours.includes(tourId)
  );
  
  // Calculate the total available tickets in the bucket
  const bucketMaxTickets = bucketAssignedToTour ? bucketAssignedToTour.max_tickets : 0;
  
  // Calculate allocated tickets to other tours from this bucket
  const allocatedToOtherTours = bucketAssignedToTour ? 
    bucketAssignedToTour.tour_allocations?.reduce((total, allocation) => 
      allocation.tour_id !== tourId ? total + allocation.tickets_required : total, 0) || 0 : 0;
  
  // Calculate the total available tickets for this tour
  const totalBucketTickets = bucketMaxTickets > allocatedToOtherTours ? 
    bucketMaxTickets - allocatedToOtherTours : 0;

  // Log calculations for debugging
  useEffect(() => {
    console.log(`🎫 [TicketBucketInfo] Calculated tickets for tour ${tourId}:`, {
      tourId,
      bucketMaxTickets,
      allocatedToOtherTours,
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
        allocatedTickets: bucketAssignedToTour.allocated_tickets,
        assignedTours: bucketAssignedToTour.assigned_tours?.length || 0,
        tourAllocations: bucketAssignedToTour.tour_allocations
      } : null
    });
  }, [validBuckets, requiredTickets, totalParticipants, bucketAssignedToTour, tourId, guideTicketsNeeded, totalBucketTickets, bucketMaxTickets, allocatedToOtherTours]);

  // We have enough tickets if a bucket is assigned to this tour and has enough available tickets
  const hasEnoughBucketTickets = !!bucketAssignedToTour && totalBucketTickets >= requiredTickets;

  // Add guide tickets information to buckets for consistent display
  const bucketsWithGuideInfo = validBuckets.map(bucket => ({
    ...bucket,
    guide_tickets: bucket.assigned_tours?.includes(tourId) ? guideTicketsNeeded : 0
  }));

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
        buckets={bucketsWithGuideInfo} 
        onRemoveBucket={(bucketId) => handleRemoveBucket(bucketId, tourId)} 
        tourId={tourId}
        requiredTickets={requiredTickets}
      />

      <TicketBucketFooter 
        totalBucketTickets={totalBucketTickets} 
        requiredTickets={requiredTickets} 
        hasEnoughBucketTickets={hasEnoughBucketTickets}
        guideTicketsNeeded={guideTicketsNeeded}
      />
      
      {isAssignDialogOpen && (
        <AssignBucketDialog 
          isOpen={isAssignDialogOpen} 
          onClose={() => setIsAssignDialogOpen(false)} 
          tourId={tourId}
          tourDate={tourDate}
          requiredTickets={requiredTickets}
        />
      )}
    </div>
  );
};
