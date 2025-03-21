
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { 
  TourInformationCard,
  ParticipantsCard,
  TicketsCard,
  TourGroupsSection
} from "./overview";
import { useState, useEffect } from "react";
import { calculateTotalParticipants, calculateTotalChildCount } from "@/hooks/group-management/services/participantService";
import { GroupAssignment } from "./groups-management/GroupAssignment";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { useGroupManagement } from "@/hooks/group-management";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  const queryClient = useQueryClient();
  
  // Use useGroupManagement to get the accurate participant data
  const { localTourGroups, refreshParticipants } = useGroupManagement(tour);
  
  // Force a data refresh to ensure UI is consistent
  useEffect(() => {
    if (tour && tour.id) {
      queryClient.invalidateQueries({ queryKey: ['tour', tour.id] });
      
      // Initial load of participants
      refreshParticipants();
    }
  }, [tour?.id, queryClient, refreshParticipants]);
  
  console.log("PARTICIPANTS DEBUG: TourOverview initializing with tour:", {
    tourId: tour.id,
    tourName: tour.tourName,
    isHighSeason: tour.isHighSeason,
    tourGroupsCount: Array.isArray(tour.tourGroups) ? tour.tourGroups.length : 0,
    localTourGroupsCount: Array.isArray(localTourGroups) ? localTourGroups.length : 0
  });
  
  // We prioritize localTourGroups for accurate data from the participant management
  const tourGroups = Array.isArray(localTourGroups) && localTourGroups.length > 0 
    ? localTourGroups 
    : (Array.isArray(tour.tourGroups) ? tour.tourGroups : []);
  
  // CRUCIAL DEBUG: Log complete tour groups data
  console.log("PARTICIPANTS DEBUG: TourOverview detailed tourGroups data:", 
    tourGroups.map(g => ({
      id: g.id,
      name: g.name || 'Unnamed',
      size: g.size,
      childCount: g.childCount,
      guideId: g.guideId,
      hasParticipantsArray: Array.isArray(g.participants),
      participantsLength: Array.isArray(g.participants) ? g.participants.length : 0,
      participants: Array.isArray(g.participants) ? g.participants.map(p => ({
        id: p.id,
        name: p.name,
        count: p.count || 1,
        childCount: p.childCount || 0
      })) : []
    }))
  );
  
  // ULTRA BUGFIX: Detail each participant explicitly for accurate counting
  console.log("PARTICIPANTS DEBUG: TourOverview starting fresh participant count");
  let totalParticipants = 0;
  let totalChildCount = 0;
  
  // CRITICAL FIX: Only count from participants arrays, never use size
  for (const group of tourGroups) {
    console.log(`PARTICIPANTS DEBUG: Processing group "${group.name || 'Unnamed'}"`);
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      let groupChildCount = 0;
      
      // Log each participant individually
      for (const participant of group.participants) {
        const count = participant.count || 1;
        const childCount = participant.childCount || 0;
        
        console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}":`, {
          count,
          childCount
        });
        
        groupTotal += count;
        groupChildCount += childCount;
      }
      
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" totals:`, {
        groupTotal,
        groupChildCount
      });
      
      totalParticipants += groupTotal;
      totalChildCount += groupChildCount;
    } else {
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants array or it's empty`);
      
      // Fall back to size for the UI display if we need to
      if (group.size && group.size > 0) {
        totalParticipants += group.size;
        totalChildCount += group.childCount || 0;
        
        console.log(`PARTICIPANTS DEBUG: Falling back to group size: ${group.size}, childCount: ${group.childCount || 0}`);
      }
    }
  }
  
  // CRITICAL FIX: Explicitly convert to boolean to ensure consistent behavior
  const isHighSeason = Boolean(tour.isHighSeason);
  
  console.log('PARTICIPANTS DEBUG: TourOverview final calculations:', {
    totalParticipants,
    totalChildCount, 
    adultCount: totalParticipants - totalChildCount,
    isHighSeason,
    tourGroups: tourGroups.length
  });
  
  // Calculate tickets based on actual participant counts
  const adultTickets = totalParticipants - totalChildCount;
  const childTickets = totalChildCount;
  
  // Use the actual calculated values for the total tickets
  const totalTickets = totalParticipants;
  
  // Pass the required tickets to show missing tickets if any
  const requiredTickets = tour.numTickets || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TourInformationCard 
          referenceCode={tour.referenceCode} 
          tourType={tour.tourType} 
        />
        
        <ParticipantsCard 
          tourGroups={tourGroups}
          totalParticipants={totalParticipants}
          totalChildCount={totalChildCount}
          isHighSeason={isHighSeason}
        />
        
        <TicketsCard
          adultTickets={adultTickets}
          childTickets={childTickets}
          totalTickets={totalTickets}
          requiredTickets={requiredTickets > 0 ? requiredTickets : totalParticipants}
        />
      </div>
      
      <Separator className="my-6" />
      
      <TourGroupsSection
        tour={tour}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
      
      <Separator className="my-6" />
      
      {/* Integrated Group Assignment with correct participant data */}
      <GroupAssignment
        tour={{...tour, isHighSeason}}
      />
    </div>
  );
};
