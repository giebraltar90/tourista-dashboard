
import { useState, useEffect } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { 
  calculateTotalParticipants, 
  calculateTotalChildCount,
  calculateGuideTickets,
  calculateGuideChildTickets
} from "@/hooks/group-management/services/participantService";

interface ParticipantCounts {
  totalParticipants: number;
  totalChildCount: number;
  totalTicketsNeeded: number;
  guideTicketsNeeded: number;
  guideChildTicketsNeeded: number;
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
    guideChildTicketsNeeded: 0
  });
  
  useEffect(() => {
    // Calculate baseline counts
    const totalParticipants = calculateTotalParticipants(groups);
    const totalChildCount = calculateTotalChildCount(groups);
    
    // Extract guide types from guide info and enrich with guide types
    const enrichedGuides = [
      guide1Name ? {
        id: "guide1",
        name: guide1Name,
        info: {
          ...guide1Info,
          guideType: guide1Info?.guideType || "GA Ticket"
        }
      } : null,
      guide2Name ? {
        id: "guide2",
        name: guide2Name,
        info: {
          ...guide2Info,
          guideType: guide2Info?.guideType || "GA Ticket"
        }
      } : null,
      guide3Name ? {
        id: "guide3",
        name: guide3Name,
        info: {
          ...guide3Info,
          guideType: guide3Info?.guideType || "GA Ticket"
        }
      } : null
    ].filter(Boolean) as Array<{
      id: string;
      name: string;
      info: any;
    }>;
    
    // Check if this specific tour requires guide tickets based on location
    const isTourRequiringGuideTickets = 
      location?.toLowerCase().includes('versailles') || 
      location?.toLowerCase().includes('montmartre');
    
    console.log(`GUIDE TICKET DEBUG: Tour location "${location}" requires guide tickets: ${isTourRequiringGuideTickets}`);
    
    // Calculate adult guide tickets (GA Ticket guides)
    const guideTicketsNeeded = calculateGuideTickets(
      location,
      guide1Name,
      guide2Name,
      guide3Name
    );
    
    // Calculate child guide tickets (GA Free guides)
    const guideChildTicketsNeeded = calculateGuideChildTickets(
      location,
      enrichedGuides
    );
    
    console.log("GUIDE TICKETS DEBUG:", {
      enrichedGuides: enrichedGuides.map(g => ({
        name: g.name,
        type: g.info?.guideType
      })),
      guideTicketsNeeded,
      guideChildTicketsNeeded,
      location,
      requiresTickets: isTourRequiringGuideTickets
    });
    
    // Calculate total tickets needed:
    // Adult participants - child participants + guide tickets
    const adultParticipants = totalParticipants - totalChildCount;
    const totalTicketsNeeded = adultParticipants + guideTicketsNeeded;
    
    setCounts({
      totalParticipants,
      totalChildCount,
      totalTicketsNeeded,
      guideTicketsNeeded,
      guideChildTicketsNeeded
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
