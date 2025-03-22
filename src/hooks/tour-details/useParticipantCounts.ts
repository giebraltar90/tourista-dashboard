
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
    
    // Ensure guide names are valid (not empty strings)
    const validGuide1 = guide1Name && guide1Name.trim() !== '';
    const validGuide2 = guide2Name && guide2Name.trim() !== '';
    const validGuide3 = guide3Name && guide3Name.trim() !== '';
    
    // Special case check for Sophie Miller
    const isSophieMillerGuide1 = validGuide1 && guide1Name.toLowerCase().includes('sophie miller');
    const isSophieMillerGuide2 = validGuide2 && guide2Name.toLowerCase().includes('sophie miller');
    const isSophieMillerGuide3 = validGuide3 && guide3Name.toLowerCase().includes('sophie miller');
    
    // If any guide is Sophie Miller, ensure they're set to GC type
    if (isSophieMillerGuide1 && guide1Info && guide1Info.guideType !== 'GC') {
      console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Forcing Sophie Miller (guide1) to GC type`);
      guide1Info.guideType = 'GC';
    }
    
    if (isSophieMillerGuide2 && guide2Info && guide2Info.guideType !== 'GC') {
      console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Forcing Sophie Miller (guide2) to GC type`);
      guide2Info.guideType = 'GC';
    }
    
    if (isSophieMillerGuide3 && guide3Info && guide3Info.guideType !== 'GC') {
      console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Forcing Sophie Miller (guide3) to GC type`);
      guide3Info.guideType = 'GC';
    }
    
    // Log all guide information for debugging
    console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] FULL GUIDE INFO for location "${location}":`, {
      guide1: validGuide1 ? {
        name: guide1Name,
        info: guide1Info,
        type: guide1Info?.guideType || 'unknown',
        needsTicket: guide1Info ? doesGuideNeedTicket(guide1Info, location) : false,
        isSophieMiller: isSophieMillerGuide1
      } : null,
      guide2: validGuide2 ? {
        name: guide2Name,
        info: guide2Info,
        type: guide2Info?.guideType || 'unknown',
        needsTicket: guide2Info ? doesGuideNeedTicket(guide2Info, location) : false,
        isSophieMiller: isSophieMillerGuide2
      } : null,
      guide3: validGuide3 ? {
        name: guide3Name,
        info: guide3Info,
        type: guide3Info?.guideType || 'unknown',
        needsTicket: guide3Info ? doesGuideNeedTicket(guide3Info, location) : false,
        isSophieMiller: isSophieMillerGuide3
      } : null,
      location,
      validGuide1,
      validGuide2,
      validGuide3
    });
    
    // Set default guide ticket counts
    let guideAdultTickets = 0;
    let guideChildTickets = 0;
    
    // Keep a record of which guides we've processed to avoid duplicates
    const processedGuides = new Set<string>();
    
    // Explicitly check each guide for ticket requirements
    if (guide1Info && validGuide1) {
      const guideName = guide1Name.trim();
      
      // Skip if already processed this guide
      if (!processedGuides.has(guideName.toLowerCase())) {
        processedGuides.add(guideName.toLowerCase());
        
        // Skip ticket counting for Sophie Miller since she should always be GC
        if (guideName.toLowerCase().includes('sophie miller')) {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Sophie Miller detected as guide1, setting as GC (no ticket needed)`);
          // Ensure Sophie Miller is always GC type
          guide1Info.guideType = 'GC';
        }
        
        const needsTicket = doesGuideNeedTicket(guide1Info, location);
        const ticketType = getGuideTicketType(guide1Info);
        
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide1 ticket check for ${guideName}:`, {
          guideName,
          guideType: guide1Info.guideType,
          needsTicket,
          ticketType,
          location,
          isSophieMiller: isSophieMillerGuide1
        });
        
        if (needsTicket) {
          if (ticketType === 'adult') {
            guideAdultTickets++;
            console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 1 (${guideName}) needs an adult ticket`);
          } else if (ticketType === 'child') {
            guideChildTickets++;
            console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 1 (${guideName}) needs a child ticket`);
          }
        } else {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 1 (${guideName}) does NOT need a ticket`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 1 (${guideName}) already processed, skipping`);
      }
    }
    
    // Only check guide2 if both name and info exist
    if (guide2Info && validGuide2) {
      const guideName = guide2Name.trim();
      
      // Skip if already processed this guide (e.g., if guide2 has same name as guide1)
      if (!processedGuides.has(guideName.toLowerCase())) {
        processedGuides.add(guideName.toLowerCase());
        
        // Skip ticket counting for Sophie Miller since she should always be GC
        if (guideName.toLowerCase().includes('sophie miller')) {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Sophie Miller detected as guide2, setting as GC (no ticket needed)`);
          // Ensure Sophie Miller is always GC type
          guide2Info.guideType = 'GC';
        }
        
        const needsTicket = doesGuideNeedTicket(guide2Info, location);
        const ticketType = getGuideTicketType(guide2Info);
        
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide2 ticket check for ${guideName}:`, {
          guideName,
          guideType: guide2Info.guideType,
          needsTicket,
          ticketType,
          location,
          isSophieMiller: isSophieMillerGuide2
        });
        
        if (needsTicket) {
          if (ticketType === 'adult') {
            guideAdultTickets++;
            console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 2 (${guideName}) needs an adult ticket`);
          } else if (ticketType === 'child') {
            guideChildTickets++;
            console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 2 (${guideName}) needs a child ticket`);
          }
        } else {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 2 (${guideName}) does NOT need a ticket`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 2 (${guideName}) already processed, skipping`);
      }
    }
    
    // Only check guide3 if both name and info exist
    if (guide3Info && validGuide3) {
      const guideName = guide3Name.trim();
      
      // Skip if already processed this guide
      if (!processedGuides.has(guideName.toLowerCase())) {
        processedGuides.add(guideName.toLowerCase());
        
        // Skip ticket counting for Sophie Miller since she should always be GC
        if (guideName.toLowerCase().includes('sophie miller')) {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Sophie Miller detected as guide3, setting as GC (no ticket needed)`);
          // Ensure Sophie Miller is always GC type
          guide3Info.guideType = 'GC';
        }
        
        const needsTicket = doesGuideNeedTicket(guide3Info, location);
        const ticketType = getGuideTicketType(guide3Info);
        
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide3 ticket check for ${guideName}:`, {
          guideName,
          guideType: guide3Info.guideType,
          needsTicket,
          ticketType,
          location,
          isSophieMiller: isSophieMillerGuide3
        });
        
        if (needsTicket) {
          if (ticketType === 'adult') {
            guideAdultTickets++;
            console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 3 (${guideName}) needs an adult ticket`);
          } else if (ticketType === 'child') {
            guideChildTickets++;
            console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 3 (${guideName}) needs a child ticket`);
          }
        } else {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 3 (${guideName}) does NOT need a ticket`);
        }
      } else {
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide 3 (${guideName}) already processed, skipping`);
      }
    }
    
    console.log("GUIDE TICKETS DEBUG: [useParticipantCounts] Final ticket calculations:", {
      guideAdultTickets,
      guideChildTickets,
      location,
      processedGuidesCount: processedGuides.size,
      processedGuides: Array.from(processedGuides),
      validGuideCount: [validGuide1, validGuide2, validGuide3].filter(Boolean).length,
      guideNames: {
        guide1: validGuide1 ? guide1Name : 'invalid',
        guide2: validGuide2 ? guide2Name : 'invalid',
        guide3: validGuide3 ? guide3Name : 'invalid',
      },
      sophieMiller: {
        isGuide1: isSophieMillerGuide1,
        isGuide2: isSophieMillerGuide2,
        isGuide3: isSophieMillerGuide3,
        guide1Type: guide1Info?.guideType,
        guide2Type: guide2Info?.guideType,
        guide3Type: guide3Info?.guideType
      }
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
