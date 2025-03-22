
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare } from "lucide-react";
import { TicketsManagementProps } from "./types";
import { TicketStatus } from "./TicketStatus";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { useTicketBuckets } from "@/hooks/useTicketBuckets";
import { useEffect } from "react";
import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/guides/useGuideTickets";
import { useParticipantCounts } from "@/hooks/tour-details/useParticipantCounts";

export const TicketsManagement = ({ tour, guide1Info, guide2Info, guide3Info }: TicketsManagementProps) => {
  // Use the correct hook to calculate participant counts for this specific tour
  const participantCounts = useParticipantCounts(
    tour.tourGroups,
    guide1Info,
    guide2Info, 
    guide3Info,
    tour.guide1,
    tour.guide2,
    tour.guide3,
    tour.location,
    []
  );
  
  const { 
    totalParticipants, 
    totalChildCount,
    adultTickets,
    childTickets,
    guideAdultTickets,
    guideChildTickets,
    totalTickets
  } = participantCounts;
  
  // Calculate total guide tickets needed
  const guideTicketsNeeded = guideAdultTickets + guideChildTickets;
  
  // Total required tickets including guides
  const requiredTickets = totalParticipants + guideTicketsNeeded;

  // Fetch ticket buckets for this specific tour
  const { data: ticketBuckets = [], isLoading: isLoadingBuckets } = useTicketBuckets(tour.id);
  const tourDate = new Date(tour.date);
  
  // Calculate if we have enough tickets for this tour
  const availableTickets = ticketBuckets.length > 0 ? 
    ticketBuckets.reduce((sum, b) => b.tour_id === tour.id ? sum + b.max_tickets : sum, 0) : 
    (tour.numTickets || totalParticipants);
  
  const hasEnoughTickets = availableTickets >= requiredTickets;
  
  // Log ticket calculations for debugging
  useEffect(() => {
    console.log(`🎫 [TicketsManagement] Ticket requirements for tour ${tour.id} at ${tour.location}:`, {
      tourId: tour.id,
      tourLocation: tour.location,
      totalParticipants,
      totalChildCount,
      adultTickets,
      childTickets,
      guideAdultTickets,
      guideChildTickets,
      guideTicketsNeeded,
      requiredTickets,
      bucketCount: ticketBuckets.length,
      availableTickets,
      hasEnoughTickets
    });
  }, [
    tour.id,
    tour.location,
    ticketBuckets, 
    totalParticipants, 
    totalChildCount,
    guideTicketsNeeded, 
    requiredTickets, 
    adultTickets,
    childTickets,
    guideAdultTickets,
    guideChildTickets,
    availableTickets
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
            guideTicketsNeeded={guideTicketsNeeded}
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
