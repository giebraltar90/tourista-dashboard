
import { useState, useEffect } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { 
  calculateTotalParticipants, 
  calculateTotalChildCount
} from "@/hooks/group-management/services/participantService";
import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/guides/useGuideTickets";

export interface ParticipantCounts {
  totalParticipants: number;
  totalChildCount: number;
  totalTicketsNeeded: number;
  guideTicketsNeeded: number;
  guideChildTicketsNeeded: number;
  adultTickets: number;
  childTickets: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  totalTickets: number;
}

/**
 * Hook to calculate various participant counts for a tour
 */
export const useParticipantCounts = (
  groups: VentrataTourGroup[],
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  guide1Name: string,
  guide2Name: string,
  guide3Name: string,
  location: string,
  allGuides: Array<{
    id: string;
    name: string;
    guideType?: string;
  }> = []
): ParticipantCounts => {
  const [counts, setCounts] = useState<ParticipantCounts>({
    totalParticipants: 0,
    totalChildCount: 0,
    totalTicketsNeeded: 0,
    guideTicketsNeeded: 0,
    guideChildTicketsNeeded: 0,
    adultTickets: 0,
    childTickets: 0,
    guideAdultTickets: 0, 
    guideChildTickets: 0,
    totalTickets: 0
  });
  
  useEffect(() => {
    // Calculate baseline counts from participant data
    const totalParticipants = calculateTotalParticipants(groups);
    const totalChildCount = calculateTotalChildCount(groups);
    
    console.log(`GUIDE TICKET DEBUG: Initial participant counts for location "${location}":`, {
      totalParticipants,
      totalChildCount,
      guide1: guide1Name ? { name: guide1Name, type: guide1Info?.guideType || 'unknown' } : null,
      guide2: guide2Name ? { name: guide2Name, type: guide2Info?.guideType || 'unknown' } : null,
      guide3: guide3Name ? { name: guide3Name, type: guide3Info?.guideType || 'unknown' } : null,
    });
    
    // Set default guide ticket counts
    let guideAdultTickets = 0;
    let guideChildTickets = 0;
    
    // Only check guide1 if both name and info exist
    if (guide1Info && guide1Name && guide1Name.trim() !== '') {
      const needsTicket = doesGuideNeedTicket(guide1Info, location);
      const ticketType = getGuideTicketType(guide1Info);
      
      if (needsTicket) {
        if (ticketType === 'adult') {
          guideAdultTickets++;
          console.log(`GUIDE TICKET DEBUG: Guide 1 (${guide1Name}) needs an adult ticket`);
        } else if (ticketType === 'child') {
          guideChildTickets++;
          console.log(`GUIDE TICKET DEBUG: Guide 1 (${guide1Name}) needs a child ticket`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: Guide 1 (${guide1Name}) does NOT need a ticket`);
      }
    }
    
    // Only check guide2 if both name and info exist
    if (guide2Info && guide2Name && guide2Name.trim() !== '') {
      const needsTicket = doesGuideNeedTicket(guide2Info, location);
      const ticketType = getGuideTicketType(guide2Info);
      
      if (needsTicket) {
        if (ticketType === 'adult') {
          guideAdultTickets++;
          console.log(`GUIDE TICKET DEBUG: Guide 2 (${guide2Name}) needs an adult ticket`);
        } else if (ticketType === 'child') {
          guideChildTickets++;
          console.log(`GUIDE TICKET DEBUG: Guide 2 (${guide2Name}) needs a child ticket`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: Guide 2 (${guide2Name}) does NOT need a ticket`);
      }
    }
    
    // Only check guide3 if both name and info exist
    if (guide3Info && guide3Name && guide3Name.trim() !== '') {
      const needsTicket = doesGuideNeedTicket(guide3Info, location);
      const ticketType = getGuideTicketType(guide3Info);
      
      if (needsTicket) {
        if (ticketType === 'adult') {
          guideAdultTickets++;
          console.log(`GUIDE TICKET DEBUG: Guide 3 (${guide3Name}) needs an adult ticket`);
        } else if (ticketType === 'child') {
          guideChildTickets++;
          console.log(`GUIDE TICKET DEBUG: Guide 3 (${guide3Name}) needs a child ticket`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: Guide 3 (${guide3Name}) does NOT need a ticket`);
      }
    }
    
    console.log("GUIDE TICKETS DEBUG: Final ticket calculations:", {
      guideAdultTickets,
      guideChildTickets,
      location,
      guideCount: [guide1Name, guide2Name, guide3Name].filter(Boolean).length
    });
    
    // Calculate adult participants (total - children)
    const adultParticipants = totalParticipants - totalChildCount;
    
    // Calculate total tickets needed (participants + guides)
    const totalTicketsNeeded = adultParticipants + totalChildCount + guideAdultTickets + guideChildTickets;
    
    setCounts({
      totalParticipants,
      totalChildCount,
      totalTicketsNeeded,
      guideTicketsNeeded: guideAdultTickets + guideChildTickets,
      guideChildTicketsNeeded: guideChildTickets,
      adultTickets: adultParticipants,
      childTickets: totalChildCount,
      guideAdultTickets,
      guideChildTickets,
      totalTickets: totalParticipants
    });
  }, [
    groups, 
    guide1Info, 
    guide2Info, 
    guide3Info, 
    guide1Name, 
    guide2Name, 
    guide3Name, 
    location,
    allGuides
  ]);
  
  return counts;
};
