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
  adultParticipants: number;
  adultTickets: number;
  childTickets: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  guideTicketsNeeded: number;
  totalTickets: number;
  totalTicketsNeeded: number;
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
    adultParticipants: 0,
    adultTickets: 0,
    childTickets: 0,
    guideAdultTickets: 0,
    guideChildTickets: 0,
    guideTicketsNeeded: 0,
    totalTickets: 0,
    totalTicketsNeeded: 0
  });
  
  useEffect(() => {
    // Calculate baseline counts from participant data
    const totalParticipants = calculateTotalParticipants(groups);
    const totalChildCount = calculateTotalChildCount(groups);
    const adultParticipants = totalParticipants - totalChildCount;
    
    // Set default guide ticket counts
    let guideAdultTickets = 0;
    let guideChildTickets = 0;
    
    // Keep track of processed guides to avoid duplicates
    const processedGuides = new Set<string>();
    
    // Process guide1
    if (guide1Info && guide1Name) {
      const guideName = guide1Name.toLowerCase().trim();
      
      // Skip if already processed or if it's Sophie Miller
      if (!processedGuides.has(guideName)) {
        processedGuides.add(guideName);
        
        // Check if this guide needs a ticket
        const needsTicket = doesGuideNeedTicket(guide1Info, location);
        const ticketType = getGuideTicketType(guide1Info);
        
        if (needsTicket) {
          if (ticketType === 'adult') {
            guideAdultTickets++;
          } else if (ticketType === 'child') {
            guideChildTickets++;
          }
        }
      }
    }
    
    // Process guide2
    if (guide2Info && guide2Name) {
      const guideName = guide2Name.toLowerCase().trim();
      
      // Skip if already processed or if it's Sophie Miller
      if (!processedGuides.has(guideName)) {
        processedGuides.add(guideName);
        
        // Check if this guide needs a ticket
        const needsTicket = doesGuideNeedTicket(guide2Info, location);
        const ticketType = getGuideTicketType(guide2Info);
        
        if (needsTicket) {
          if (ticketType === 'adult') {
            guideAdultTickets++;
          } else if (ticketType === 'child') {
            guideChildTickets++;
          }
        }
      }
    }
    
    // Process guide3
    if (guide3Info && guide3Name) {
      const guideName = guide3Name.toLowerCase().trim();
      
      // Skip if already processed or if it's Sophie Miller
      if (!processedGuides.has(guideName)) {
        processedGuides.add(guideName);
        
        // Check if this guide needs a ticket
        const needsTicket = doesGuideNeedTicket(guide3Info, location);
        const ticketType = getGuideTicketType(guide3Info);
        
        if (needsTicket) {
          if (ticketType === 'adult') {
            guideAdultTickets++;
          } else if (ticketType === 'child') {
            guideChildTickets++;
          }
        }
      }
    }
    
    // Calculate total guide tickets needed
    const guideTicketsNeeded = guideAdultTickets + guideChildTickets;
    
    // Calculate total tickets (participants + guides)
    const totalTicketsNeeded = totalParticipants + guideTicketsNeeded;
    
    setCounts({
      totalParticipants,
      totalChildCount,
      adultParticipants,
      adultTickets: adultParticipants,
      childTickets: totalChildCount,
      guideAdultTickets,
      guideChildTickets,
      guideTicketsNeeded,
      totalTickets: totalParticipants,
      totalTicketsNeeded
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
