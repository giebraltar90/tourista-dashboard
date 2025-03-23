
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketsManagementProps } from "./types";
import { useEffect } from "react";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { useGuideTicketRequirements } from "@/hooks/tour-details/useGuideTicketRequirements";
import { logger } from "@/utils/logger";

export const TicketsManagement = ({ 
  tour, 
  guide1Info, 
  guide2Info, 
  guide3Info 
}: TicketsManagementProps) => {
  // Calculate total participants and child count
  const totalParticipants = tour.tourGroups.reduce(
    (sum, group) => sum + group.size, 
    0
  );
  
  const totalChildCount = tour.tourGroups.reduce(
    (sum, group) => sum + group.childCount, 
    0
  );
  
  const adultParticipants = totalParticipants - totalChildCount;
  
  // Use the hook to determine guide requirements
  const { locationNeedsGuideTickets, hasAssignedGuides, guideTickets } = useGuideTicketRequirements(
    tour, guide1Info, guide2Info, guide3Info
  );
  
  // Get guide ticket counts from the hook response
  const { 
    adultTickets: guideAdultTickets, 
    childTickets: guideChildTickets,
    guides: guidesWithTickets
  } = guideTickets;
  
  // Total tickets needed including guides
  const totalAdultTicketsNeeded = adultParticipants + guideAdultTickets;
  const totalChildTicketsNeeded = totalChildCount + guideChildTickets;
  const totalTicketsNeeded = totalAdultTicketsNeeded + totalChildTicketsNeeded;
  
  // Log the total tickets needed for debugging
  useEffect(() => {
    logger.debug(`🎟️ [TicketsManagement] Tour ${tour.id} ticket requirements:`, {
      tourName: tour.tourName || 'Unknown Tour',
      referenceCode: tour.referenceCode || 'Unknown Ref',
      location: tour.location || 'Unknown Location',
      hasAssignedGuides,
      adultParticipants,
      totalChildCount,
      guideAdultTickets,
      guideChildTickets,
      totalTicketsNeeded,
      guidesWithTicketsCount: guidesWithTickets.length,
      guideDetails: guidesWithTickets.map(g => ({
        name: g.guideName,
        type: g.guideType,
        ticketType: g.ticketType
      }))
    });
  }, [
    tour.id, tour.tourName, tour.referenceCode, tour.location, hasAssignedGuides,
    adultParticipants, totalChildCount, guideAdultTickets, guideChildTickets,
    totalTicketsNeeded, guidesWithTickets
  ]);
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
      </CardHeader>
      <CardContent>
        <TicketBucketInfo
          buckets={[]}
          isLoading={false}
          tourId={tour.id}
          requiredTickets={totalTicketsNeeded}
          tourDate={tour.date}
          totalParticipants={totalParticipants}
        />
      </CardContent>
    </Card>
  );
};
