
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare } from "lucide-react";
import { TicketsManagementProps } from "./types";
import { TicketStatus } from "./TicketStatus";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { useTicketBuckets } from "@/hooks/useTicketBuckets";
import { useEffect } from "react";
import { useParticipantCounts } from "@/hooks/tour-details/useParticipantCounts";

export const TicketsManagement = ({ tour, guide1Info, guide2Info, guide3Info }: TicketsManagementProps) => {
  // Use the participant counts hook to get ticket requirements
  const participantCounts = useParticipantCounts(
    tour.tourGroups || [],
    tour.location || ''
  );
  
  const { totalParticipants } = participantCounts;
  
  // Total required tickets is just participants (removed guide tickets)
  const requiredTickets = totalParticipants;

  // Fetch ticket buckets for this specific tour
  const { data: ticketBuckets = [], isLoading: isLoadingBuckets } = useTicketBuckets(tour.id);
  const tourDate = new Date(tour.date);
  
  // Find bucket for this tour
  const bucketAssignedToTour = ticketBuckets.find(bucket => 
    bucket.assigned_tours && bucket.assigned_tours.includes(tour.id)
  );
  
  // Find the allocation specifically for this tour
  const tourAllocation = bucketAssignedToTour?.tour_allocations?.find(
    allocation => allocation.tour_id === tour.id
  );
  const ticketsAllocatedToThisTour = tourAllocation?.tickets_required || 0;
  
  // Calculate bucket metrics
  const bucketMaxTickets = bucketAssignedToTour ? bucketAssignedToTour.max_tickets : 0;
  
  // Calculate allocated tickets to other tours from this bucket
  const allocatedToOtherTours = bucketAssignedToTour ? 
    (bucketAssignedToTour.allocated_tickets || 0) - ticketsAllocatedToThisTour : 0;
  
  // Available tickets is the max tickets minus allocations to other tours
  const availableTickets = bucketAssignedToTour ? bucketMaxTickets - allocatedToOtherTours : 0;
  
  // Calculate if we have enough tickets for this tour
  const hasEnoughTickets = availableTickets >= requiredTickets;
  
  // Log ticket calculations for debugging
  useEffect(() => {
    console.log(`🎫 [TicketsManagement] Ticket requirements for tour ${tour.id} at ${tour.location}:`, {
      tourId: tour.id,
      tourLocation: tour.location,
      tourGroups: tour.tourGroups?.length || 0,
      totalParticipants,
      // Totals and allocation
      requiredTickets,
      bucketCount: ticketBuckets.length,
      bucketMaxTickets,
      allocatedToOtherTours,
      availableTickets,
      hasEnoughTickets
    });
  }, [
    tour.id,
    tour.location,
    tour.tourGroups,
    ticketBuckets, 
    totalParticipants, 
    requiredTickets, 
    availableTickets,
    bucketMaxTickets,
    allocatedToOtherTours,
    ticketsAllocatedToThisTour
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
        <CardDescription>Manage tickets for {tour.tourName || 'this tour'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Ticket buckets section */}
          <TicketBucketInfo 
            buckets={ticketBuckets} 
            isLoading={isLoadingBuckets} 
            tourId={tour.id}
            requiredTickets={requiredTickets}
            tourDate={tourDate}
            totalParticipants={totalParticipants}
          />
          
          <Separator />
          
          {/* Ticket status summary */}
          <TicketStatus
            purchasedCount={availableTickets}
            pendingCount={0}
            distributedCount={requiredTickets}
          />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button className="ml-auto">
          <PenSquare className="mr-2 h-4 w-4" />
          Manage Tickets
        </Button>
      </CardFooter>
    </Card>
  );
};
