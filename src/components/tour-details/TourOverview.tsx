
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
  
  console.log("PARTICIPANTS DEBUG: TourOverview initializing with tour:", {
    tourId: tour.id,
    tourName: tour.tourName,
    isHighSeason: tour.isHighSeason,
    tourGroupsCount: Array.isArray(tour.tourGroups) ? tour.tourGroups.length : 0
  });
  
  // Ensure tourGroups exists to prevent errors
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  // CRITICAL DEBUG: Log complete tour groups data
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
      
      {/* Integrated Group Assignment with correct participant data */}
      <GroupAssignment
        tour={{...tour, isHighSeason}}
      />
    </div>
  );
};
