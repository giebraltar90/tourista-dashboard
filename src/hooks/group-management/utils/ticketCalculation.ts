
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

  // Log guide information for debugging
  logger.debug("🎟️ [TicketRequirement] Checking guide ticket requirement", {
    guideName: guideInfo.name,
    guideType: guideInfo.guideType,
    guideId: guideInfo.id || 'unknown',
    location
  });

  // Normalize location to lowercase for case-insensitive comparison
  const locationLower = (location || '').toLowerCase().trim();
  
  // Check if location requires tickets (only Versailles and Montmartre need tickets)
  if (!locationLower || 
      (!locationLower.includes('versailles') && 
       !locationLower.includes('versaille') && 
       !locationLower.includes('montmartre'))) {
    logger.debug(`🎟️ [TicketRequirement] Location "${location}" doesn't require guide tickets`);
    return { needsTicket: false, ticketType: null };
  }

  // Normalize guide type to uppercase for consistent comparison
  const guideType = (guideInfo.guideType || "").toUpperCase();

  // GC guides never need tickets
  if (guideType === "GC") {
    logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} is GC, no ticket needed`);
    return { needsTicket: false, ticketType: null };
  } 
  
  // GA Free (under 26) guides need child tickets
  else if (guideType.includes("FREE") || guideType.includes("UNDER") || guideType.includes("U26")) {
    logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} is FREE (under 26), needs child ticket`);
    return { needsTicket: true, ticketType: "child" };
  } 
  
  // GA Ticket (over 26) guides need adult tickets
  else if (guideType.includes("TICKET") || guideType.includes("GA ") || guideType.includes("ADULT")) {
    logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} is TICKET (over 26), needs adult ticket`);
    return { needsTicket: true, ticketType: "adult" };
  }
  
  // Default: Unknown guide types assume adult ticket
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
  
  // Normalize location to lowercase for case-insensitive comparison
  const locationLower = (location || '').toLowerCase().trim();
  
  logger.debug("🎟️ [CalculateTickets] Starting guide ticket calculation", {
    tourId: tourGroups[0]?.tourId || 'unknown',
    guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'null',
    guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'null',
    guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'null',
    location,
    locationLower,
    tourGroupsCount: tourGroups?.length || 0
  });

  // Skip ticket calculation if location doesn't require tickets
  if (!locationLower || 
      (!locationLower.includes('versailles') && 
       !locationLower.includes('versaille') && 
       !locationLower.includes('montmartre'))) {
    logger.debug(`🎟️ [CalculateTickets] Location "${location}" doesn't require guide tickets`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // IMPORTANT: Find which guides are actually assigned to groups
  const assignedGuideIds = new Set<string>();
  
  tourGroups.forEach(group => {
    if (group.guideId && group.guideId !== "unassigned") {
      // Check if this guide matches one of our main guides
      if (guide1Info && (group.guideId === guide1Info.id || group.guideId === guide1Info.name || group.guideId === "guide1")) {
        assignedGuideIds.add("guide1");
        logger.debug(`🎟️ [CalculateTickets] Found guide1 assigned to group ${group.name || 'Unnamed'}`);
      }
      else if (guide2Info && (group.guideId === guide2Info.id || group.guideId === guide2Info.name || group.guideId === "guide2")) {
        assignedGuideIds.add("guide2");
        logger.debug(`🎟️ [CalculateTickets] Found guide2 assigned to group ${group.name || 'Unnamed'}`);
      }
      else if (guide3Info && (group.guideId === guide3Info.id || group.guideId === guide3Info.name || group.guideId === "guide3")) {
        assignedGuideIds.add("guide3");
        logger.debug(`🎟️ [CalculateTickets] Found guide3 assigned to group ${group.name || 'Unnamed'}`);
      }
    }
  });
  
  logger.debug(`🎟️ [CalculateTickets] Found assigned guides: ${Array.from(assignedGuideIds).join(', ') || 'none'}`);
  
  // Process guide1 - only if actually assigned
  if (guide1Info && assignedGuideIds.has("guide1")) {
    logger.debug(`🎟️ [CalculateTickets] Processing assigned guide1 (${guide1Info.name})`);
    
    const { needsTicket, ticketType } = getGuideTicketRequirement(guide1Info, location);
    
    if (needsTicket) {
      if (ticketType === "adult") adultTickets++;
      if (ticketType === "child") childTickets++;
      
      guides.push({
        guideName: guide1Info.name || "Guide 1",
        guideType: String(guide1Info.guideType) || "Unknown",
        ticketType
      });
      
      logger.debug(`🎟️ [CalculateTickets] Guide1 needs a ${ticketType} ticket`);
    } else {
      logger.debug(`🎟️ [CalculateTickets] Guide1 doesn't need a ticket`);
    }
  }
  
  // Process guide2 - only if actually assigned
  if (guide2Info && assignedGuideIds.has("guide2")) {
    logger.debug(`🎟️ [CalculateTickets] Processing assigned guide2 (${guide2Info.name})`);
    
    const { needsTicket, ticketType } = getGuideTicketRequirement(guide2Info, location);
    
    if (needsTicket) {
      if (ticketType === "adult") adultTickets++;
      if (ticketType === "child") childTickets++;
      
      guides.push({
        guideName: guide2Info.name || "Guide 2",
        guideType: String(guide2Info.guideType) || "Unknown",
        ticketType
      });
      
      logger.debug(`🎟️ [CalculateTickets] Guide2 needs a ${ticketType} ticket`);
    } else {
      logger.debug(`🎟️ [CalculateTickets] Guide2 doesn't need a ticket`);
    }
  }
  
  // Process guide3 - only if actually assigned
  if (guide3Info && assignedGuideIds.has("guide3")) {
    logger.debug(`🎟️ [CalculateTickets] Processing assigned guide3 (${guide3Info.name})`);
    
    const { needsTicket, ticketType } = getGuideTicketRequirement(guide3Info, location);
    
    if (needsTicket) {
      if (ticketType === "adult") adultTickets++;
      if (ticketType === "child") childTickets++;
      
      guides.push({
        guideName: guide3Info.name || "Guide 3",
        guideType: String(guide3Info.guideType) || "Unknown",
        ticketType
      });
      
      logger.debug(`🎟️ [CalculateTickets] Guide3 needs a ${ticketType} ticket`);
    } else {
      logger.debug(`🎟️ [CalculateTickets] Guide3 doesn't need a ticket`);
    }
  }

  // Final count check
  logger.debug("🎟️ [CalculateTickets] Final guide ticket counts", {
    adultTickets,
    childTickets,
    guidesWithTickets: guides.length,
    assignedGuideCount: assignedGuideIds.size,
    guideDetails: guides.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType || 'No ticket'}`)
  });
  
  return { 
    adultTickets, 
    childTickets, 
    guides 
  };
};
