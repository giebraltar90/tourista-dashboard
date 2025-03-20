
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

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  const queryClient = useQueryClient();
  
  // Force a data refresh to ensure UI is consistent
  useEffect(() => {
    if (tour && tour.id) {
      queryClient.invalidateQueries({ queryKey: ['tour', tour.id] });
    }
  }, [tour?.id, queryClient]);
  
  // Ensure tourGroups exists to prevent errors
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  // ENHANCED DEBUG: Log the raw tour data
  console.log("ENHANCED DEBUG: TourOverview raw tour data:", {
    tourId: tour.id,
    isHighSeason: tour.isHighSeason,
    rawTourGroups: tourGroups,
    groupsCount: tourGroups.length
  });
  
  // CRITICAL BUGFIX: Directly count participants from the group participants array
  let totalParticipants = 0;
  let totalChildCount = 0;
  
  // BUGFIX: Loop through participants and count correctly
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Count directly from participants array
      for (const participant of group.participants) {
        totalParticipants += participant.count || 1;
        totalChildCount += participant.childCount || 0;
      }
      
      console.log(`BUGFIX: Group ${group.name} participants calculation:`, {
        groupId: group.id,
        groupName: group.name,
        directTotal: group.participants.reduce((sum, p) => sum + (p.count || 1), 0),
        directChildCount: group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0),
        participantsCount: group.participants.length,
        participantDetails: group.participants.map(p => ({ 
          name: p.name, 
          count: p.count || 1, 
          childCount: p.childCount || 0 
        }))
      });
    } else if (group.size) {
      // Fallback to group size/childCount if no participants array is available
      console.log(`BUGFIX: No participants for group ${group.name}, using size properties:`, {
        groupId: group.id,
        groupName: group.name,
        size: group.size || 0,
        childCount: group.childCount || 0
      });
      
      // Only use size properties when absolutely necessary (no participants array)
      totalParticipants += group.size || 0;
      totalChildCount += group.childCount || 0;
    }
  }
  
  // CRITICAL FIX: Explicitly convert to boolean to ensure consistent behavior
  const isHighSeason = Boolean(tour.isHighSeason);
  
  console.log('BUGFIX: TourOverview final calculations:', {
    totalParticipants,
    totalChildCount, 
    adultCount: totalParticipants - totalChildCount,
    isHighSeason
  });
  
  // Calculate tickets based on actual participant counts
  const adultTickets = totalParticipants - totalChildCount;
  const childTickets = totalChildCount;
  
  // Use the actual calculated values for the total tickets
  const totalTickets = totalParticipants;

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
      
      {/* Integrated Group Assignment with participant functionality */}
      <GroupAssignment
        tour={{...tour, isHighSeason}}
      />
    </div>
  );
};
