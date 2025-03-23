
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketsManagementProps } from "./types";
import { useEffect } from "react";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { calculateGuideTicketsNeeded } from "@/hooks/group-management/utils/ticketCalculation";
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
  
  // Check if any guides are actually assigned to groups
  const hasAssignedGuides = tour.tourGroups.some(group => 
    group.guideId && group.guideId !== "unassigned"
  );
  
  // Location check for guide tickets
  const locationLower = (tour.location || '').toLowerCase().trim();
  const locationNeedsGuideTickets = 
    locationLower.includes('versailles') || 
    locationLower.includes('montmartre') ||
    locationLower.includes('versaille');
  
  // Calculate tickets needed for guides based on guide types
  const { 
    adultTickets: guideAdultTickets, 
    childTickets: guideChildTickets,
    guides: guidesWithTickets
  } = (locationNeedsGuideTickets && hasAssignedGuides) 
    ? calculateGuideTicketsNeeded(
        guide1Info,
        guide2Info,
        guide3Info,
        tour.location,
        tour.tourGroups
      )
    : { adultTickets: 0, childTickets: 0, guides: [] };
  
  // Total tickets needed including guides
  const totalAdultTicketsNeeded = adultParticipants + guideAdultTickets;
  const totalChildTicketsNeeded = totalChildCount + guideChildTickets;
  const totalTicketsNeeded = totalAdultTicketsNeeded + totalChildTicketsNeeded;
  
  // Log the total tickets needed for debugging
  useEffect(() => {
    logger.debug(`🎟️ [TicketsManagement] Tour ${tour.id} ticket requirements:`, {
      location: tour.location,
      locationNeedsGuideTickets,
      hasAssignedGuides,
      adultParticipants,
      totalChildCount,
      guideAdultTickets,
      guideChildTickets,
      totalTicketsNeeded,
      guidesWithTicketsCount: guidesWithTickets.length
    });
  }, [
    tour.id, tour.location, locationNeedsGuideTickets, hasAssignedGuides,
    adultParticipants, totalChildCount, guideAdultTickets, guideChildTickets,
    totalTicketsNeeded, guidesWithTickets.length
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
