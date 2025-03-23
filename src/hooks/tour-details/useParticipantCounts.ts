
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
    
    // Prepare processed guide information to avoid duplicate processing
    // For Sophie Miller, we'll ensure she's always treated as a GC guide who doesn't need a ticket
    const processedGuides: {[name: string]: {needsTicket: boolean, ticketType: 'adult' | 'child' | null}} = {};
    let guideAdultTickets = 0;
    let guideChildTickets = 0;
    
    // Create a helper function to process a guide
    const processGuide = (guideName: string, guideInfo: GuideInfo | null) => {
      // Skip empty guides or those we've already processed
      if (!guideName || processedGuides[guideName.toLowerCase()]) {
        return;
      }
      
      // For Sophie Miller, force GC guide type
      if (guideName.toLowerCase().includes('sophie miller')) {
        if (guideInfo) {
          guideInfo.guideType = 'GC';
        }
      }
      
      // Check if this guide needs a ticket
      const needsTicket = doesGuideNeedTicket(guideInfo, location);
      const ticketType = getGuideTicketType(guideInfo);
      
      // Add to processed guides to avoid duplicates
      processedGuides[guideName.toLowerCase()] = { needsTicket, ticketType };
      
      // Increment ticket counters if needed
      if (needsTicket) {
        if (ticketType === 'adult') {
          guideAdultTickets++;
        } else if (ticketType === 'child') {
          guideChildTickets++;
        }
      }
      
      // Debug logging
      console.log(`Guide processed: ${guideName}`, { 
        needsTicket, 
        ticketType, 
        guideType: guideInfo?.guideType,
        isSophieMiller: guideName.toLowerCase().includes('sophie miller')
      });
    };
    
    // Process the main guides
    if (guide1Name && guide1Info) {
      processGuide(guide1Name, guide1Info);
    }
    
    if (guide2Name && guide2Info) {
      processGuide(guide2Name, guide2Info);
    }
    
    if (guide3Name && guide3Info) {
      processGuide(guide3Name, guide3Info);
    }
    
    // Calculate total guide tickets needed
    const guideTicketsNeeded = guideAdultTickets + guideChildTickets;
    
    // Calculate total tickets (participants + guides)
    const totalTicketsNeeded = totalParticipants + guideTicketsNeeded;
    
    // Log complete ticket calculation for debugging
    console.log("🎫 FINAL TICKET CALCULATION:", {
      location,
      totalParticipants,
      totalChildCount,
      adultParticipants,
      guideAdultTickets,
      guideChildTickets,
      guideTicketsNeeded,
      totalTicketsNeeded,
      guides: {
        guide1: guide1Name ? { name: guide1Name, type: guide1Info?.guideType, needsTicket: processedGuides[guide1Name.toLowerCase()]?.needsTicket } : null,
        guide2: guide2Name ? { name: guide2Name, type: guide2Info?.guideType, needsTicket: processedGuides[guide2Name.toLowerCase()]?.needsTicket } : null,
        guide3: guide3Name ? { name: guide3Name, type: guide3Info?.guideType, needsTicket: processedGuides[guide3Name.toLowerCase()]?.needsTicket } : null,
      }
    });
    
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
