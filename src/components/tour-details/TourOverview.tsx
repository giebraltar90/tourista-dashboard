
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
  
  // CRITICAL FIX: Only calculate from participants array data to ensure consistency
  let totalParticipants = 0;
  let totalChildCount = 0;
  
  // Loop through each group and calculate from the participants array
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Sum the count values for participants in this group
      const groupParticipants = group.participants.reduce((sum, p) => sum + (p.count || 1), 0);
      const groupChildCount = group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0);
      
      console.log(`ENHANCED DEBUG: Group ${group.name} participants calculation:`, {
        id: group.id,
        name: group.name,
        groupParticipants,
        groupChildCount,
        participantsCount: group.participants.length,
        participantDetails: group.participants.map(p => ({ 
          name: p.name, 
          count: p.count || 1, 
          childCount: p.childCount || 0 
        }))
      });
      
      totalParticipants += groupParticipants;
      totalChildCount += groupChildCount;
    } else {
      // Fallback to group size/childCount if participants array isn't available
      console.log(`ENHANCED DEBUG: Group ${group.name} size properties:`, {
        id: group.id,
        name: group.name,
        size: group.size || 0,
        childCount: group.childCount || 0
      });
      
      totalParticipants += group.size || 0;
      totalChildCount += group.childCount || 0;
    }
  }
  
  // CRITICAL FIX: Explicitly convert to boolean to ensure consistent behavior
  const isHighSeason = Boolean(tour.isHighSeason);
  
  console.log('ENHANCED DEBUG: TourOverview final calculations:', {
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
