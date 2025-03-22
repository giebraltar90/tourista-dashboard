
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
  
  // Calculate guide tickets if it's a location requiring guide tickets
  let guideAdultTickets = 0;
  let guideChildTickets = 0;
  
  const isTourRequiringGuideTickets = 
    location.toLowerCase().includes('versailles') || 
    location.toLowerCase().includes('montmartre');
  
  if (isTourRequiringGuideTickets) {
    // Check guide 1
    if (guide1Info && doesGuideNeedTicket(guide1Info, location)) {
      const ticketType = getGuideTicketType(guide1Info);
      if (ticketType === 'adult') {
        guideAdultTickets++;
        console.log(`GUIDE TICKET DEBUG: Adding adult ticket for guide ${guide1Info.name} (${guide1Info.guideType})`);
      } else if (ticketType === 'child') {
        guideChildTickets++;
        console.log(`GUIDE TICKET DEBUG: Adding child ticket for guide ${guide1Info.name} (${guide1Info.guideType})`);
      }
    }
    
    // Check guide 2
    if (guide2Info && doesGuideNeedTicket(guide2Info, location)) {
      const ticketType = getGuideTicketType(guide2Info);
      if (ticketType === 'adult') {
        guideAdultTickets++;
        console.log(`GUIDE TICKET DEBUG: Adding adult ticket for guide ${guide2Info.name} (${guide2Info.guideType})`);
      } else if (ticketType === 'child') {
        guideChildTickets++;
        console.log(`GUIDE TICKET DEBUG: Adding child ticket for guide ${guide2Info.name} (${guide2Info.guideType})`);
      }
    }
    
    // Check guide 3
    if (guide3Info && doesGuideNeedTicket(guide3Info, location)) {
      const ticketType = getGuideTicketType(guide3Info);
      if (ticketType === 'adult') {
        guideAdultTickets++;
        console.log(`GUIDE TICKET DEBUG: Adding adult ticket for guide ${guide3Info.name} (${guide3Info.guideType})`);
      } else if (ticketType === 'child') {
        guideChildTickets++;
        console.log(`GUIDE TICKET DEBUG: Adding child ticket for guide ${guide3Info.name} (${guide3Info.guideType})`);
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
