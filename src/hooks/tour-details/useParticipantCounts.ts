
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
      tourLocation: location,
      guide1: guide1Info ? { id: guide1Info.id, name: guide1Info.name, type: guide1Info.guideType } : null,
      guide2: guide2Info ? { id: guide2Info.id, name: guide2Info.name, type: guide2Info.guideType } : null,
      guide3: guide3Info ? { id: guide3Info.id, name: guide3Info.name, type: guide3Info.guideType } : null,
    });
  }, [tourGroups, guide1Info, guide2Info, guide3Info, location]);
  
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
  
  // Calculate guide tickets if it's a location requiring guide tickets
  let guideAdultTickets = 0;
  let guideChildTickets = 0;
  
  // Check if this specific tour requires guide tickets based on location
  const isTourRequiringGuideTickets = 
    location.toLowerCase().includes('versailles') || 
    location.toLowerCase().includes('montmartre');
  
  console.log(`GUIDE TICKET DEBUG: Tour location "${location}" requires guide tickets: ${isTourRequiringGuideTickets}`);
  
  if (isTourRequiringGuideTickets) {
    // Check guide 1 - only if we have valid guide info and a valid ID
    if (guide1Info && guide1) {
      if (doesGuideNeedTicket(guide1Info, location)) {
        const ticketType = getGuideTicketType(guide1Info);
        if (ticketType === 'adult') {
          guideAdultTickets++;
          console.log(`GUIDE TICKET DEBUG: Adding adult ticket for guide ${guide1Info.name} (${guide1Info.guideType})`);
        } else if (ticketType === 'child') {
          guideChildTickets++;
          console.log(`GUIDE TICKET DEBUG: Adding child ticket for guide ${guide1Info.name} (${guide1Info.guideType})`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: Guide 1 ${guide1Info.name} does not need a ticket at ${location}`);
      }
    } else {
      console.log(`GUIDE TICKET DEBUG: Guide 1 ${guide1} has no valid info`);
    }
    
    // Check guide 2 - only if we have valid guide info and a valid ID
    if (guide2Info && guide2) {
      if (doesGuideNeedTicket(guide2Info, location)) {
        const ticketType = getGuideTicketType(guide2Info);
        if (ticketType === 'adult') {
          guideAdultTickets++;
          console.log(`GUIDE TICKET DEBUG: Adding adult ticket for guide ${guide2Info.name} (${guide2Info.guideType})`);
        } else if (ticketType === 'child') {
          guideChildTickets++;
          console.log(`GUIDE TICKET DEBUG: Adding child ticket for guide ${guide2Info.name} (${guide2Info.guideType})`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: Guide 2 ${guide2Info.name} does not need a ticket at ${location}`);
      }
    } else if (guide2) {
      console.log(`GUIDE TICKET DEBUG: Guide 2 ${guide2} has no valid info`);
    }
    
    // Check guide 3 - only if we have valid guide info and a valid ID
    if (guide3Info && guide3) {
      if (doesGuideNeedTicket(guide3Info, location)) {
        const ticketType = getGuideTicketType(guide3Info);
        if (ticketType === 'adult') {
          guideAdultTickets++;
          console.log(`GUIDE TICKET DEBUG: Adding adult ticket for guide ${guide3Info.name} (${guide3Info.guideType})`);
        } else if (ticketType === 'child') {
          guideChildTickets++;
          console.log(`GUIDE TICKET DEBUG: Adding child ticket for guide ${guide3Info.name} (${guide3Info.guideType})`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: Guide 3 ${guide3Info.name} does not need a ticket at ${location}`);
      }
    } else if (guide3) {
      console.log(`GUIDE TICKET DEBUG: Guide 3 ${guide3} has no valid info`);
    }
    
    console.log(`GUIDE TICKET DEBUG: Final count for tour at ${location}: ${guideAdultTickets} adult tickets, ${guideChildTickets} child tickets required for guides`);
  }
  
  // Calculate the total tickets needed including participant and guide tickets
  const totalTickets = adultTickets + childTickets + guideAdultTickets + guideChildTickets;
  
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
