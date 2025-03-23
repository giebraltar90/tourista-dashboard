
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";

/**
 * Determine what ticket type a guide needs based on their guide type
 */
export const getGuideTicketRequirement = (
  guideInfo: GuideInfo | null | undefined,
  location: string = ""
): { needsTicket: boolean; ticketType: "adult" | "child" | null } => {
  // If no guide info, no ticket needed
  if (!guideInfo) {
    return { needsTicket: false, ticketType: null };
  }

  // Log for debugging
  logger.debug("🎟️ [TicketRequirement] Checking guide ticket requirement", {
    guideName: guideInfo.name,
    guideType: guideInfo.guideType,
    location
  });

  // Get guide type and handle different formats
  const guideType = (guideInfo.guideType || "").toUpperCase();
  
  if (guideType === "GC") {
    // GC guides can guide inside, don't need tickets
    logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} is GC, no ticket needed`);
    return { needsTicket: false, ticketType: null };
  } else if (guideType.includes("FREE") || guideType.includes("UNDER") || guideType.includes("U26")) {
    // Under 26, requires a child ticket
    logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} is FREE (under 26), needs child ticket`);
    return { needsTicket: true, ticketType: "child" };
  } else if (guideType.includes("TICKET") || guideType.includes("GA ") || guideType.includes("ADULT")) {
    // Over 26, requires an adult ticket
    logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} is TICKET (over 26), needs adult ticket`);
    return { needsTicket: true, ticketType: "adult" };
  }
  
  // Default case - if guide type is unknown, assume they need an adult ticket
  // This is safer than assuming they don't need one
  logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} has unknown type (${guideType}), defaulting to adult ticket`);
  return { needsTicket: true, ticketType: "adult" };
};

/**
 * Calculate how many tickets are needed for all guides on a tour
 */
export const calculateGuideTicketsNeeded = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = "",
  tourGroups: any[] = []
): { adultTickets: number; childTickets: number; guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> } => {
  let adultTickets = 0;
  let childTickets = 0;
  const guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> = [];
  
  logger.debug("🎟️ [CalculateTickets] Starting guide ticket calculation", {
    hasGuide1: !!guide1Info,
    hasGuide2: !!guide2Info, 
    hasGuide3: !!guide3Info,
    location,
    tourGroupsCount: tourGroups?.length || 0
  });
  
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
    
    logger.debug(`🎟️ [CalculateTickets] Processed guide1 (${guide1Info.name})`, {
      needsTicket,
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
    
    logger.debug(`🎟️ [CalculateTickets] Processed guide2 (${guide2Info.name})`, {
      needsTicket,
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
    
    logger.debug(`🎟️ [CalculateTickets] Processed guide3 (${guide3Info.name})`, {
      needsTicket,
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
        
        logger.debug(`🎟️ [CalculateTickets] Processed group guide (${group.guideInfo.name})`, {
          groupId: group.id,
          guideId: group.guideId,
          needsTicket,
          ticketType
        });
      }
    }
  }
  
  logger.debug("🎟️ [CalculateTickets] Final guide ticket requirements", {
    adultTickets,
    childTickets,
    guidesWithTickets: guides.filter(g => g.ticketType !== null).length
  });
  
  return { adultTickets, childTickets, guides: guides.filter(g => g.ticketType !== null) };
};
