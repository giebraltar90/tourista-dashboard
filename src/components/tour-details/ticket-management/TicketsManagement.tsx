
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketsManagementProps } from "./types";
import { useEffect } from "react";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { calculateGuideTicketsNeeded } from "@/hooks/group-management/utils";

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
  
  // Calculate tickets needed for guides based on guide types
  const { 
    adultTickets: guideAdultTickets, 
    childTickets: guideChildTickets,
    guides: guidesWithTickets
  } = calculateGuideTicketsNeeded(
    guide1Info,
    guide2Info,
    guide3Info,
    tour.location,
    tour.tourGroups
  );
  
  // Total tickets needed including guides
  const totalAdultTicketsNeeded = adultParticipants + guideAdultTickets;
  const totalChildTicketsNeeded = totalChildCount + guideChildTickets;
  const totalTicketsNeeded = totalAdultTicketsNeeded + totalChildTicketsNeeded;
  
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
