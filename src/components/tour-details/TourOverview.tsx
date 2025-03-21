
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
import { getGuideNameAndInfo } from "@/hooks/group-management/utils/guideInfoUtils";
import { useGuideData } from "@/hooks/guides/useGuideData";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  const queryClient = useQueryClient();
  const { guides: allGuides = [] } = useGuideData() || { guides: [] };
  
  const { localTourGroups, refreshParticipants } = useGroupManagement(tour);
  
  useEffect(() => {
    if (tour && tour.id) {
      queryClient.invalidateQueries({ queryKey: ['tour', tour.id] });
      refreshParticipants();
    }
  }, [tour?.id, queryClient, refreshParticipants]);
  
  console.log("GUIDE TICKET DEBUG: TourOverview initializing with tour:", {
    tourId: tour.id,
    tourName: tour.tourName,
    isHighSeason: tour.isHighSeason,
    guide1Info: guide1Info ? { id: guide1Info.id, name: guide1Info.name, guideType: guide1Info.guideType } : null,
    guide2Info: guide2Info ? { id: guide2Info.id, name: guide2Info.name, guideType: guide2Info.guideType } : null,
    guide3Info: guide3Info ? { id: guide3Info.id, name: guide3Info.name, guideType: guide3Info.guideType } : null,
    tourGroupsCount: Array.isArray(tour.tourGroups) ? tour.tourGroups.length : 0,
    localTourGroupsCount: Array.isArray(localTourGroups) ? localTourGroups.length : 0
  });
  
  const tourGroups = Array.isArray(localTourGroups) && localTourGroups.length > 0 
    ? localTourGroups 
    : (Array.isArray(tour.tourGroups) ? tour.tourGroups : []);
  
  console.log("GUIDE TICKET DEBUG: TourOverview detailed tourGroups data:", 
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
    console.log(`GUIDE TICKET DEBUG: Processing group "${group.name || 'Unnamed'}"`);
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      let groupChildCount = 0;
      
      for (const participant of group.participants) {
        const count = participant.count || 1;
        const childCount = participant.childCount || 0;
        
        groupTotal += count;
        groupChildCount += childCount;
      }
      
      console.log(`GUIDE TICKET DEBUG: Group "${group.name || 'Unnamed'}" totals:`, {
        groupTotal,
        groupChildCount
      });
      
      totalParticipants += groupTotal;
      totalChildCount += groupChildCount;
    } else if (group.size > 0) {
      totalParticipants += group.size;
      totalChildCount += group.childCount || 0;
      
      console.log(`GUIDE TICKET DEBUG: Falling back to group size: ${group.size}, childCount: ${group.childCount || 0}`);
    }
  }
  
  const isHighSeason = Boolean(tour.isHighSeason);
  
  const adultTickets = totalParticipants - totalChildCount;
  const childTickets = totalChildCount;
  
  const totalTickets = totalParticipants;
  
  const requiredTickets = tour.numTickets || 0;
  
  const isVersaillesTour = tour.location.toLowerCase().includes('versailles');
  let guideAdultTickets = 0;
  let guideChildTickets = 0;
  
  if (isVersaillesTour) {
    const countedGuideIds = new Set();
    
    for (const group of tourGroups) {
      if (group.guideId && !countedGuideIds.has(group.guideId)) {
        // Use our improved utility to get guide info
        const { info: guideInfo } = getGuideNameAndInfo(
          tour.guide1,
          tour.guide2,
          tour.guide3,
          guide1Info,
          guide2Info,
          guide3Info,
          allGuides,
          group.guideId
        );
        
        if (guideInfo) {
          countedGuideIds.add(group.guideId);
          
          console.log(`GUIDE TICKET DEBUG: Found guide info for group with guide ${guideInfo.name}:`, {
            id: guideInfo.id,
            name: guideInfo.name,
            guideType: guideInfo.guideType
          });
          
          if (doesGuideNeedTicket(guideInfo, tour.location)) {
            const ticketType = getGuideTicketType(guideInfo);
            if (ticketType === 'adult') {
              guideAdultTickets++;
              console.log(`GUIDE TICKET DEBUG: Adding adult ticket for guide ${guideInfo.name} (${guideInfo.guideType})`);
            }
            if (ticketType === 'child') {
              guideChildTickets++;
              console.log(`GUIDE TICKET DEBUG: Adding child ticket for guide ${guideInfo.name} (${guideInfo.guideType})`);
            }
          } else {
            console.log(`GUIDE TICKET DEBUG: No ticket needed for guide ${guideInfo.name} (${guideInfo.guideType})`);
          }
        } else {
          console.log(`GUIDE TICKET DEBUG: Could not find guide info for guideId: ${group.guideId}`);
        }
      }
    }
    
    console.log(`GUIDE TICKET DEBUG: Final count: ${guideAdultTickets} adult tickets, ${guideChildTickets} child tickets required for guides`);
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
