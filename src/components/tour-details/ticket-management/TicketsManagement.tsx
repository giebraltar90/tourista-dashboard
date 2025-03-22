
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
import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/guides/useGuideTickets";

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
  
  // Calculate guide tickets directly using the guide info and type
  let directGuideAdultTickets = 0;
  let directGuideChildTickets = 0;
  
  // Track which guides need tickets for detailed debugging
  const guidesNeedingTickets: {
    guideName: string;
    guideType: string | undefined;
    needsTicket: boolean;
    ticketType: string | null;
  }[] = [];
  
  // Check if location requires guide tickets
  const isLocationRequiringTickets = 
    tour.location?.toLowerCase().includes('versailles') || 
    tour.location?.toLowerCase().includes('montmartre');
  
  // Only calculate guide tickets if location requires them
  if (isLocationRequiringTickets) {
    // Calculate guide tickets directly
    if (guide1Info && tour.guide1) {
      const needsTicket = doesGuideNeedTicket(guide1Info, tour.location);
      const ticketType = getGuideTicketType(guide1Info);
      
      guidesNeedingTickets.push({
        guideName: tour.guide1,
        guideType: guide1Info.guideType,
        needsTicket,
        ticketType
      });
      
      if (needsTicket) {
        if (ticketType === 'adult') directGuideAdultTickets++;
        else if (ticketType === 'child') directGuideChildTickets++;
      }
    }
    
    if (guide2Info && tour.guide2) {
      const needsTicket = doesGuideNeedTicket(guide2Info, tour.location);
      const ticketType = getGuideTicketType(guide2Info);
      
      guidesNeedingTickets.push({
        guideName: tour.guide2,
        guideType: guide2Info.guideType,
        needsTicket,
        ticketType
      });
      
      if (needsTicket) {
        if (ticketType === 'adult') directGuideAdultTickets++;
        else if (ticketType === 'child') directGuideChildTickets++;
      }
    }
    
    if (guide3Info && tour.guide3) {
      const needsTicket = doesGuideNeedTicket(guide3Info, tour.location);
      const ticketType = getGuideTicketType(guide3Info);
      
      guidesNeedingTickets.push({
        guideName: tour.guide3,
        guideType: guide3Info.guideType,
        needsTicket,
        ticketType
      });
      
      if (needsTicket) {
        if (ticketType === 'adult') directGuideAdultTickets++;
        else if (ticketType === 'child') directGuideChildTickets++;
      }
    }
  }
  
  // Calculate directly the total guide tickets needed
  const directGuideTicketsNeeded = directGuideAdultTickets + directGuideChildTickets;
  
  // Total required tickets including guides
  const requiredTickets = totalParticipants + directGuideTicketsNeeded;

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
      // Old calculation method
      guideAdultTickets,
      guideChildTickets,
      guideTicketsFromHook: guideAdultTickets + guideChildTickets,
      // New direct calculation
      directGuideAdultTickets,
      directGuideChildTickets,
      directGuideTicketsNeeded,
      // Guides details
      guidesNeedingTickets,
      // Totals and allocation
      requiredTickets,
      bucketCount: ticketBuckets.length,
      availableTickets,
      hasEnoughTickets,
      isLocationRequiringTickets
    });
  }, [
    tour.id,
    tour.location,
    ticketBuckets, 
    totalParticipants, 
    totalChildCount,
    directGuideTicketsNeeded, 
    requiredTickets, 
    adultTickets,
    childTickets,
    guideAdultTickets,
    guideChildTickets,
    availableTickets,
    directGuideAdultTickets,
    directGuideChildTickets,
    guidesNeedingTickets
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
            guideTicketsNeeded={directGuideTicketsNeeded}
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
