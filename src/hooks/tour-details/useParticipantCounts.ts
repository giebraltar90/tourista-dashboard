
import { useEffect } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { getGuideNameAndInfo } from "@/hooks/group-management/utils/guideInfoUtils";
import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/guides/useGuideTickets";

export interface ParticipantCountsResult {
  totalParticipants: number;
  totalChildCount: number;
  adultTickets: number;
  childTickets: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  totalTickets: number;
}

export const useParticipantCounts = (
  tourGroups: VentrataTourGroup[],
  guide1Info: any | null,
  guide2Info: any | null,
  guide3Info: any | null,
  guide1: string,
  guide2: string,
  guide3: string,
  location: string,
  allGuides: any[] = []
): ParticipantCountsResult => {
  // For logging purposes only
  useEffect(() => {
    console.log("GUIDE TICKET DEBUG: useParticipantCounts called with:", {
      tourGroupsLength: tourGroups?.length || 0,
      guide1: guide1Info ? { id: guide1Info.id, name: guide1Info.name } : null,
      guide2: guide2Info ? { id: guide2Info.id, name: guide2Info.name } : null,
      guide3: guide3Info ? { id: guide3Info.id, name: guide3Info.name } : null,
    });
  }, [tourGroups, guide1Info, guide2Info, guide3Info]);
  
  // Calculate total participants and child count
  let totalParticipants = 0;
  let totalChildCount = 0;
  
  if (Array.isArray(tourGroups)) {
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
  }
  
  // Calculate ticket counts
  const adultTickets = totalParticipants - totalChildCount;
  const childTickets = totalChildCount;
  const totalTickets = totalParticipants;
  
  // Calculate guide tickets if it's a Versailles tour
  let guideAdultTickets = 0;
  let guideChildTickets = 0;
  
  const isVersaillesTour = location.toLowerCase().includes('versailles');
  
  if (isVersaillesTour) {
    const countedGuideIds = new Set();
    
    for (const group of tourGroups) {
      if (group.guideId && !countedGuideIds.has(group.guideId)) {
        // Use our improved utility to get guide info
        const { info: guideInfo } = getGuideNameAndInfo(
          guide1,
          guide2,
          guide3,
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
          
          if (doesGuideNeedTicket(guideInfo, location)) {
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
  
  return {
    totalParticipants,
    totalChildCount,
    adultTickets,
    childTickets,
    guideAdultTickets,
    guideChildTickets,
    totalTickets
  };
}
