
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
    
    // Make deep copies of guide info to avoid mutating the original objects
    const guide1InfoCopy = guide1Info ? {...guide1Info} : null;
    const guide2InfoCopy = guide2Info ? {...guide2Info} : null;
    const guide3InfoCopy = guide3Info ? {...guide3Info} : null;
    
    // If any guide is Sophie Miller, ensure they're set to GC type
    if (isSophieMillerGuide1 && guide1InfoCopy) {
      console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Forcing Sophie Miller (guide1) to GC type`);
      guide1InfoCopy.guideType = 'GC';
    }
    
    if (isSophieMillerGuide2 && guide2InfoCopy) {
      console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Forcing Sophie Miller (guide2) to GC type`);
      guide2InfoCopy.guideType = 'GC';
    }
    
    if (isSophieMillerGuide3 && guide3InfoCopy) {
      console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Forcing Sophie Miller (guide3) to GC type`);
      guide3InfoCopy.guideType = 'GC';
    }
    
    // Log all guide information for debugging
    console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] FULL GUIDE INFO for location "${location}":`, {
      guide1: validGuide1 ? {
        name: guide1Name,
        info: guide1InfoCopy,
        type: guide1InfoCopy?.guideType || 'unknown',
        needsTicket: guide1InfoCopy ? doesGuideNeedTicket(guide1InfoCopy, location) : false,
        isSophieMiller: isSophieMillerGuide1
      } : null,
      guide2: validGuide2 ? {
        name: guide2Name,
        info: guide2InfoCopy,
        type: guide2InfoCopy?.guideType || 'unknown',
        needsTicket: guide2InfoCopy ? doesGuideNeedTicket(guide2InfoCopy, location) : false,
        isSophieMiller: isSophieMillerGuide2
      } : null,
      guide3: validGuide3 ? {
        name: guide3Name,
        info: guide3InfoCopy,
        type: guide3InfoCopy?.guideType || 'unknown',
        needsTicket: guide3InfoCopy ? doesGuideNeedTicket(guide3InfoCopy, location) : false,
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
    if (guide1InfoCopy && validGuide1) {
      const guideName = guide1Name.trim();
      
      // Skip if already processed this guide
      if (!processedGuides.has(guideName.toLowerCase())) {
        processedGuides.add(guideName.toLowerCase());
        
        // Skip ticket counting for Sophie Miller since she should always be GC
        if (guideName.toLowerCase().includes('sophie miller')) {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Sophie Miller detected as guide1, setting as GC (no ticket needed)`);
          // Ensure Sophie Miller is always GC type
          guide1InfoCopy.guideType = 'GC';
        }
        
        const needsTicket = doesGuideNeedTicket(guide1InfoCopy, location);
        const ticketType = getGuideTicketType(guide1InfoCopy);
        
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide1 ticket check for ${guideName}:`, {
          guideName,
          guideType: guide1InfoCopy.guideType,
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
    if (guide2InfoCopy && validGuide2) {
      const guideName = guide2Name.trim();
      
      // Skip if already processed this guide (e.g., if guide2 has same name as guide1)
      if (!processedGuides.has(guideName.toLowerCase())) {
        processedGuides.add(guideName.toLowerCase());
        
        // Skip ticket counting for Sophie Miller since she should always be GC
        if (guideName.toLowerCase().includes('sophie miller')) {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Sophie Miller detected as guide2, setting as GC (no ticket needed)`);
          // Ensure Sophie Miller is always GC type
          guide2InfoCopy.guideType = 'GC';
        }
        
        const needsTicket = doesGuideNeedTicket(guide2InfoCopy, location);
        const ticketType = getGuideTicketType(guide2InfoCopy);
        
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide2 ticket check for ${guideName}:`, {
          guideName,
          guideType: guide2InfoCopy.guideType,
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
    if (guide3InfoCopy && validGuide3) {
      const guideName = guide3Name.trim();
      
      // Skip if already processed this guide
      if (!processedGuides.has(guideName.toLowerCase())) {
        processedGuides.add(guideName.toLowerCase());
        
        // Skip ticket counting for Sophie Miller since she should always be GC
        if (guideName.toLowerCase().includes('sophie miller')) {
          console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Sophie Miller detected as guide3, setting as GC (no ticket needed)`);
          // Ensure Sophie Miller is always GC type
          guide3InfoCopy.guideType = 'GC';
        }
        
        const needsTicket = doesGuideNeedTicket(guide3InfoCopy, location);
        const ticketType = getGuideTicketType(guide3InfoCopy);
        
        console.log(`GUIDE TICKET DEBUG: [useParticipantCounts] Guide3 ticket check for ${guideName}:`, {
          guideName,
          guideType: guide3InfoCopy.guideType,
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
        guide1Type: guide1InfoCopy?.guideType,
        guide2Type: guide2InfoCopy?.guideType,
        guide3Type: guide3InfoCopy?.guideType
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
