
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { 
  TourInformationCard,
  ParticipantsCard,
  TicketsCard,
  TourGroupsSection
} from "./overview";
import { useState, useEffect } from "react";
import { GroupAssignment } from "./groups-management/group-assignment";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { useGroupManagement } from "@/hooks/group-management";
import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/guides/useGuideTickets";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  const queryClient = useQueryClient();
  
  const { localTourGroups, refreshParticipants } = useGroupManagement(tour);
  
  useEffect(() => {
    if (tour && tour.id) {
      queryClient.invalidateQueries({ queryKey: ['tour', tour.id] });
      
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
  
  const tourGroups = Array.isArray(localTourGroups) && localTourGroups.length > 0 
    ? localTourGroups 
    : (Array.isArray(tour.tourGroups) ? tour.tourGroups : []);
  
  console.log("PARTICIPANTS DEBUG: TourOverview detailed tourGroups data:", 
    tourGroups.map(g => ({
      id: g.id,
      name: g.name || 'Unnamed',
      size: g.size,
      childCount: g.childCount,
      guideId: g.guideId,
      guideName: g.guideName,
      hasParticipantsArray: Array.isArray(g.participants),
      participantsLength: Array.isArray(g.participants) ? g.participants.length : 0
    }))
  );
  
  let totalParticipants = 0;
  let totalChildCount = 0;
  
  for (const group of tourGroups) {
    console.log(`PARTICIPANTS DEBUG: Processing group "${group.name || 'Unnamed'}"`);
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      let groupChildCount = 0;
      
      for (const participant of group.participants) {
        const count = participant.count || 1;
        const childCount = participant.childCount || 0;
        
        groupTotal += count;
        groupChildCount += childCount;
      }
      
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" totals:`, {
        groupTotal,
        groupChildCount
      });
      
      totalParticipants += groupTotal;
      totalChildCount += groupChildCount;
    } else if (group.size > 0) {
      totalParticipants += group.size;
      totalChildCount += group.childCount || 0;
      
      console.log(`PARTICIPANTS DEBUG: Falling back to group size: ${group.size}, childCount: ${group.childCount || 0}`);
    }
  }
  
  const isHighSeason = Boolean(tour.isHighSeason);
  
  console.log('PARTICIPANTS DEBUG: TourOverview final calculations:', {
    totalParticipants,
    totalChildCount, 
    adultCount: totalParticipants - totalChildCount,
    isHighSeason,
    tourGroups: tourGroups.length
  });
  
  const adultTickets = totalParticipants - totalChildCount;
  const childTickets = totalChildCount;
  
  const totalTickets = totalParticipants;
  
  const requiredTickets = tour.numTickets || 0;
  
  // Calculate guide ticket requirements for Versailles
  const isVersaillesTour = tour.location.toLowerCase().includes('versailles');
  let guideAdultTickets = 0;
  let guideChildTickets = 0;
  
  if (isVersaillesTour) {
    // Check for assigned guides in each tour group
    for (const group of tourGroups) {
      if (group.guideId) {
        // Find the guide info for this group's guide
        let guideInfo = null;
        
        // Check if this guide is one of the main tour guides
        if (guide1Info && (group.guideId === guide1Info.id || group.guideName === guide1Info.name)) {
          guideInfo = guide1Info;
        } else if (guide2Info && (group.guideId === guide2Info.id || group.guideName === guide2Info.name)) {
          guideInfo = guide2Info;
        } else if (guide3Info && (group.guideId === guide3Info.id || group.guideName === guide3Info.name)) {
          guideInfo = guide3Info;
        }
        
        // If we found guide info, determine ticket requirements
        if (guideInfo) {
          console.log(`GUIDE TICKETS: Found guide info for group with guide ${guideInfo.name}:`, guideInfo);
          if (doesGuideNeedTicket(guideInfo, tour.location)) {
            const ticketType = getGuideTicketType(guideInfo);
            if (ticketType === 'adult') {
              guideAdultTickets++;
              console.log(`GUIDE TICKETS: Adding adult ticket for guide ${guideInfo.name} (${guideInfo.guideType})`);
            }
            if (ticketType === 'child') {
              guideChildTickets++;
              console.log(`GUIDE TICKETS: Adding child ticket for guide ${guideInfo.name} (${guideInfo.guideType})`);
            }
          } else {
            console.log(`GUIDE TICKETS: No ticket needed for guide ${guideInfo.name} (${guideInfo.guideType})`);
          }
        } else {
          console.log(`GUIDE TICKETS: Could not find guide info for guideId: ${group.guideId}, guideName: ${group.guideName}`);
        }
      }
    }
    
    console.log(`GUIDE TICKETS: Final count: ${guideAdultTickets} adult tickets, ${guideChildTickets} child tickets required for guides`);
  }

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
          guideAdultTickets={guideAdultTickets}
          guideChildTickets={guideChildTickets}
          location={tour.location}
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
      
      <GroupAssignment
        tour={{...tour, isHighSeason}}
      />
    </div>
  );
};
