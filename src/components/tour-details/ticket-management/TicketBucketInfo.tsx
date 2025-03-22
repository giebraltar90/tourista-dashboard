
import { useState } from "react";
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
}

export const TicketBucketInfo = ({ buckets, isLoading, tourId, requiredTickets, tourDate }: TicketBucketInfoProps) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { handleRemoveBucket } = useTicketAssignmentService();

  // Calculate total tickets available in buckets
  const totalBucketTickets = buckets.reduce((sum, bucket) => {
    // Use the available_tickets property if it exists, otherwise calculate it
    const availableTickets = bucket.available_tickets !== undefined ? 
      bucket.available_tickets : 
      (bucket.max_tickets - bucket.allocated_tickets);
    
    return sum + availableTickets;
  }, 0);

  console.log("🔍 [TicketBucketInfo] Calculated total bucket tickets:", {
    totalBucketTickets,
    requiredTickets,
    bucketCount: buckets.length,
    bucketsDetail: buckets.map(b => ({
      id: b.id,
      reference: b.reference_number,
      max: b.max_tickets,
      allocated: b.allocated_tickets,
      available: b.available_tickets || (b.max_tickets - b.allocated_tickets)
    }))
  });

  // Check if we have enough tickets in buckets
  const hasEnoughBucketTickets = totalBucketTickets >= requiredTickets;

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

  if (buckets.length === 0) {
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
        buckets={buckets} 
        onRemoveBucket={(bucketId) => handleRemoveBucket(bucketId, tourId)} 
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
