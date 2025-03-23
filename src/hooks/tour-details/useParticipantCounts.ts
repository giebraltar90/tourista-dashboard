
import { useState, useEffect } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { 
  calculateTotalParticipants, 
  calculateTotalChildCount,
  calculateGuideAdultTickets,
  calculateGuideChildTickets
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
 * Determines if a guide is Sophie Miller by checking the name
 */
const isSophieMiller = (guideName: string): boolean => {
  return guideName.toLowerCase().includes('sophie miller');
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
    
    console.log("🔍 [useParticipantCounts] Starting calculation with:", {
      tourGroups: groups.length,
      location,
      guide1Name,
      guide2Name,
      guide3Name,
      totalParticipants,
      totalChildCount,
      adultParticipants
    });
    
    // For locations that don't require guide tickets, exit early
    const requiresGuideTickets = 
      location.toLowerCase().includes('versailles') || 
      location.toLowerCase().includes('montmartre');
      
    if (!requiresGuideTickets) {
      console.log("🔍 [useParticipantCounts] Location doesn't require guide tickets:", location);
      setCounts({
        totalParticipants,
        totalChildCount,
        adultParticipants,
        adultTickets: adultParticipants,
        childTickets: totalChildCount,
        guideAdultTickets: 0,
        guideChildTickets: 0,
        guideTicketsNeeded: 0,
        totalTickets: totalParticipants,
        totalTicketsNeeded: totalParticipants
      });
      return;
    }
    
    // Gather all guide names and info from tour groups
    const groupGuides: {name: string, guideType: string | undefined}[] = [];
    
    // Collect guides assigned to groups
    groups.forEach((group, index) => {
      console.log(`🔍 [useParticipantCounts] Checking group ${index} guide:`, {
        groupId: group.id,
        guideId: group.guideId,
        groupName: group.name
      });
      
      if (group.guideId) {
        // Try to find matching guide in allGuides
        const matchedGuide = allGuides.find(g => g.id === group.guideId);
        if (matchedGuide) {
          console.log(`🔍 [useParticipantCounts] Found guide in allGuides:`, {
            name: matchedGuide.name,
            guideType: matchedGuide.guideType
          });
          
          // Skip if Sophie Miller (always GC)
          if (isSophieMiller(matchedGuide.name)) {
            console.log(`🔍 [useParticipantCounts] Skipping Sophie Miller (always GC)`);
            groupGuides.push({name: matchedGuide.name, guideType: 'GC'});
          } else {
            groupGuides.push({name: matchedGuide.name, guideType: matchedGuide.guideType});
          }
        } else {
          // Check if it matches one of the main guides
          if (group.guideId === "guide1" && guide1Name) {
            console.log(`🔍 [useParticipantCounts] Group has guide1:`, {
              name: guide1Name,
              guideType: guide1Info?.guideType
            });
            
            // Skip if Sophie Miller (always GC)
            if (isSophieMiller(guide1Name)) {
              console.log(`🔍 [useParticipantCounts] Skipping Sophie Miller (always GC)`);
              groupGuides.push({name: guide1Name, guideType: 'GC'});
            } else {
              groupGuides.push({name: guide1Name, guideType: guide1Info?.guideType});
            }
          } else if (group.guideId === "guide2" && guide2Name) {
            console.log(`🔍 [useParticipantCounts] Group has guide2:`, {
              name: guide2Name,
              guideType: guide2Info?.guideType
            });
            
            // Skip if Sophie Miller (always GC)
            if (isSophieMiller(guide2Name)) {
              console.log(`🔍 [useParticipantCounts] Skipping Sophie Miller (always GC)`);
              groupGuides.push({name: guide2Name, guideType: 'GC'});
            } else {
              groupGuides.push({name: guide2Name, guideType: guide2Info?.guideType});
            }
          } else if (group.guideId === "guide3" && guide3Name) {
            console.log(`🔍 [useParticipantCounts] Group has guide3:`, {
              name: guide3Name,
              guideType: guide3Info?.guideType
            });
            
            // Skip if Sophie Miller (always GC)
            if (isSophieMiller(guide3Name)) {
              console.log(`🔍 [useParticipantCounts] Skipping Sophie Miller (always GC)`);
              groupGuides.push({name: guide3Name, guideType: 'GC'});
            } else {
              groupGuides.push({name: guide3Name, guideType: guide3Info?.guideType});
            }
          } else {
            // If we get here, we have an unknown guide ID
            console.log(`🔍 [useParticipantCounts] Unknown guide ID:`, group.guideId);
          }
        }
      }
    });
    
    // Also check main tour guides if they're not already assigned to groups
    console.log(`🔍 [useParticipantCounts] Checking main tour guides:`);
    
    const addedGuideNames = new Set(groupGuides.map(g => g.name.toLowerCase()));
    
    if (guide1Name && !addedGuideNames.has(guide1Name.toLowerCase())) {
      // Skip if Sophie Miller (always GC)
      if (isSophieMiller(guide1Name)) {
        console.log(`🔍 [useParticipantCounts] Skipping Sophie Miller (always GC)`);
        groupGuides.push({name: guide1Name, guideType: 'GC'});
      } else {
        groupGuides.push({name: guide1Name, guideType: guide1Info?.guideType});
      }
    }
    
    if (guide2Name && !addedGuideNames.has(guide2Name.toLowerCase())) {
      // Skip if Sophie Miller (always GC)
      if (isSophieMiller(guide2Name)) {
        console.log(`🔍 [useParticipantCounts] Skipping Sophie Miller (always GC)`);
        groupGuides.push({name: guide2Name, guideType: 'GC'});
      } else {
        groupGuides.push({name: guide2Name, guideType: guide2Info?.guideType});
      }
    }
    
    if (guide3Name && !addedGuideNames.has(guide3Name.toLowerCase())) {
      // Skip if Sophie Miller (always GC)
      if (isSophieMiller(guide3Name)) {
        console.log(`🔍 [useParticipantCounts] Skipping Sophie Miller (always GC)`);
        groupGuides.push({name: guide3Name, guideType: 'GC'});
      } else {
        groupGuides.push({name: guide3Name, guideType: guide3Info?.guideType});
      }
    }
    
    // Calculate guide tickets needed
    let guideAdultTickets = 0;
    let guideChildTickets = 0;
    
    // Deduplicate guides by name (case-insensitive)
    const processedGuideNames = new Set<string>();
    
    for (const guide of groupGuides) {
      const guideName = guide.name.toLowerCase();
      
      // Skip already processed guides
      if (processedGuideNames.has(guideName)) {
        console.log(`🔍 [useParticipantCounts] Skipping duplicate guide:`, guide.name);
        continue;
      }
      
      processedGuideNames.add(guideName);
      
      // Skip Sophie Miller (always GC, never needs a ticket)
      if (isSophieMiller(guideName)) {
        console.log(`🔍 [useParticipantCounts] Sophie Miller (GC) doesn't need a ticket`);
        continue;
      }
      
      // Determine if guide needs a ticket and what type
      if (guide.guideType === 'GA Ticket') {
        guideAdultTickets++;
        console.log(`🔍 [useParticipantCounts] ${guide.name} (GA Ticket) needs 1 adult ticket`);
      } else if (guide.guideType === 'GA Free') {
        guideChildTickets++;
        console.log(`🔍 [useParticipantCounts] ${guide.name} (GA Free) needs 1 child ticket`);
      } else if (guide.guideType === 'GC') {
        console.log(`🔍 [useParticipantCounts] ${guide.name} (GC) doesn't need a ticket`);
      } else {
        // Default to adult ticket if guide type is unknown
        console.log(`🔍 [useParticipantCounts] ${guide.name} (Unknown type: ${guide.guideType}) defaulting to adult ticket`);
        guideAdultTickets++;
      }
    }
    
    const guideTicketsNeeded = guideAdultTickets + guideChildTickets;
    const totalTicketsNeeded = totalParticipants + guideTicketsNeeded;
    
    console.log("🔍 [useParticipantCounts] Final guide tickets calculation:", {
      guideAdultTickets,
      guideChildTickets,
      guideTicketsNeeded,
      totalParticipants,
      totalTicketsNeeded,
      processedGuides: Array.from(processedGuideNames)
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
