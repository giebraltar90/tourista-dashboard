
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

  // Log for debugging with much more detail
  logger.debug("🎟️ [TicketRequirement] Checking guide ticket requirement", {
    guideName: guideInfo.name,
    guideType: guideInfo.guideType,
    location,
    guideId: guideInfo.id || 'unknown'
  });

  // Check if location requires tickets (only Versailles and Montmartre need tickets)
  if (!location || 
      (!location.toLowerCase().includes('versailles') && 
       !location.toLowerCase().includes('montmartre'))) {
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
  
  logger.debug("🎟️ [CalculateTickets] Starting guide ticket calculation", {
    guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'null',
    guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'null',
    guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'null',
    location,
    tourGroupsCount: tourGroups?.length || 0
  });

  // Skip ticket calculation if location doesn't require tickets
  if (!location || 
      (!location.toLowerCase().includes('versailles') && 
       !location.toLowerCase().includes('montmartre'))) {
    logger.debug(`🎟️ [CalculateTickets] Location "${location}" doesn't require guide tickets`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // IMPORTANT: Track processed guides to avoid counting duplicates
  const processedGuideIds = new Set<string>();
  
  // Process guide1
  if (guide1Info && guide1Info.id) {
    // Check if we've already processed this guide
    if (!processedGuideIds.has(guide1Info.id)) {
      const { needsTicket, ticketType } = getGuideTicketRequirement(guide1Info, location);
      
      if (needsTicket) {
        if (ticketType === "adult") adultTickets++;
        if (ticketType === "child") childTickets++;
      }
      
      guides.push({
        guideName: guide1Info.name || "Guide 1",
        guideType: String(guide1Info.guideType) || "Unknown",
        ticketType
      });
      
      processedGuideIds.add(guide1Info.id);
      
      logger.debug(`🎟️ [CalculateTickets] Processed guide1 (${guide1Info.name})`, {
        needsTicket,
        ticketType,
        guideType: guide1Info.guideType,
        adultTicketsRunning: adultTickets,
        childTicketsRunning: childTickets
      });
    }
  }
  
  // Process guide2
  if (guide2Info && guide2Info.id) {
    // Check if we've already processed this guide
    if (!processedGuideIds.has(guide2Info.id)) {
      const { needsTicket, ticketType } = getGuideTicketRequirement(guide2Info, location);
      
      if (needsTicket) {
        if (ticketType === "adult") adultTickets++;
        if (ticketType === "child") childTickets++;
      }
      
      guides.push({
        guideName: guide2Info.name || "Guide 2",
        guideType: String(guide2Info.guideType) || "Unknown",
        ticketType
      });
      
      processedGuideIds.add(guide2Info.id);
      
      logger.debug(`🎟️ [CalculateTickets] Processed guide2 (${guide2Info.name})`, {
        needsTicket,
        ticketType,
        guideType: guide2Info.guideType,
        adultTicketsRunning: adultTickets,
        childTicketsRunning: childTickets
      });
    }
  }
  
  // Process guide3
  if (guide3Info && guide3Info.id) {
    // Check if we've already processed this guide
    if (!processedGuideIds.has(guide3Info.id)) {
      const { needsTicket, ticketType } = getGuideTicketRequirement(guide3Info, location);
      
      if (needsTicket) {
        if (ticketType === "adult") adultTickets++;
        if (ticketType === "child") childTickets++;
      }
      
      guides.push({
        guideName: guide3Info.name || "Guide 3",
        guideType: String(guide3Info.guideType) || "Unknown",
        ticketType
      });
      
      processedGuideIds.add(guide3Info.id);
      
      logger.debug(`🎟️ [CalculateTickets] Processed guide3 (${guide3Info.name})`, {
        needsTicket,
        ticketType,
        guideType: guide3Info.guideType,
        adultTicketsRunning: adultTickets,
        childTicketsRunning: childTickets
      });
    }
  }

  // Final count check
  logger.debug("🎟️ [CalculateTickets] Final guide ticket requirements", {
    adultTickets,
    childTickets,
    guidesWithTickets: guides.filter(g => g.ticketType !== null).length,
    processedGuideIds: Array.from(processedGuideIds),
    guideDetails: guides.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType || 'No ticket'}`)
  });
  
  return { 
    adultTickets, 
    childTickets, 
    guides: guides.filter(g => g.ticketType !== null) 
  };
};
