
import { GuideInfo } from "@/types/ventrata";

/**
 * Determine what ticket type a guide needs based on their guide type
 */
export const getGuideTicketRequirement = (
  guideInfo: GuideInfo | null | undefined,
  location: string = "Versailles"
): { needsTicket: boolean; ticketType: "adult" | "child" | null } => {
  // If no guide info, no ticket needed
  if (!guideInfo) {
    return { needsTicket: false, ticketType: null };
  }

  // Default for non-Versailles locations - no special handling
  if (location !== "Versailles") {
    return { needsTicket: false, ticketType: null };
  }

  // For Versailles, ticket requirements depend on guide type
  const guideType = guideInfo.guideType || "";
  
  if (guideType.toUpperCase() === "GC") {
    // GC guides can guide inside, don't need tickets
    return { needsTicket: false, ticketType: null };
  } else if (guideType.toUpperCase() === "GA FREE" || guideType.includes("FREE")) {
    // Under 26, requires a child ticket
    return { needsTicket: true, ticketType: "child" };
  } else if (guideType.toUpperCase() === "GA TICKET" || guideType.includes("TICKET")) {
    // Over 26, requires an adult ticket
    return { needsTicket: true, ticketType: "adult" };
  }
  
  // Default case - if guide type is unknown, assume they need an adult ticket
  // This is safer than assuming they don't need one
  return { needsTicket: true, ticketType: "adult" };
};

/**
 * Calculate how many tickets are needed for all guides on a tour
 */
export const calculateGuideTicketsNeeded = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = "Versailles",
  tourGroups: any[] = []
): { adultTickets: number; childTickets: number; guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> } => {
  let adultTickets = 0;
  let childTickets = 0;
  const guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> = [];
  
  // Process guide1
  if (guide1Info) {
    const { needsTicket, ticketType } = getGuideTicketRequirement(guide1Info, location);
    
    if (needsTicket) {
      if (ticketType === "adult") adultTickets++;
      if (ticketType === "child") childTickets++;
    }
    
    guides.push({
      guideName: guide1Info.name || "Guide 1",
      guideType: guide1Info.guideType || "Unknown",
      ticketType
    });
  }
  
  // Process guide2
  if (guide2Info) {
    const { needsTicket, ticketType } = getGuideTicketRequirement(guide2Info, location);
    
    if (needsTicket) {
      if (ticketType === "adult") adultTickets++;
      if (ticketType === "child") childTickets++;
    }
    
    guides.push({
      guideName: guide2Info.name || "Guide 2",
      guideType: guide2Info.guideType || "Unknown",
      ticketType
    });
  }
  
  // Process guide3
  if (guide3Info) {
    const { needsTicket, ticketType } = getGuideTicketRequirement(guide3Info, location);
    
    if (needsTicket) {
      if (ticketType === "adult") adultTickets++;
      if (ticketType === "child") childTickets++;
    }
    
    guides.push({
      guideName: guide3Info.name || "Guide 3",
      guideType: guide3Info.guideType || "Unknown",
      ticketType
    });
  }
  
  // Also check group-assigned guides that might not be one of the main guides
  if (Array.isArray(tourGroups)) {
    // Create a map of guide IDs that we've already processed
    const processedGuideIds = new Set([
      guide1Info?.id,
      guide2Info?.id,
      guide3Info?.id
    ].filter(Boolean));
    
    // Check each group for its assigned guide
    for (const group of tourGroups) {
      if (group.guideInfo && group.guideId && !processedGuideIds.has(group.guideId)) {
        const { needsTicket, ticketType } = getGuideTicketRequirement(group.guideInfo, location);
        
        if (needsTicket) {
          if (ticketType === "adult") adultTickets++;
          if (ticketType === "child") childTickets++;
        }
        
        guides.push({
          guideName: group.guideInfo.name || "Group Guide",
          guideType: group.guideInfo.guideType || "Unknown",
          ticketType
        });
        
        // Mark this guide as processed
        processedGuideIds.add(group.guideId);
      }
    }
  }
  
  return { adultTickets, childTickets, guides };
};
