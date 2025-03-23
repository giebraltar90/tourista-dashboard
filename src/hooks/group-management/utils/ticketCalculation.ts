
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
  const locationLower = location.toLowerCase();
  
  // Check if location requires tickets (only Versailles and Montmartre need tickets)
  if (!location || 
      (!locationLower.includes('versailles') && 
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
  const locationLower = location.toLowerCase();
  
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
  if (!location || 
      (!locationLower.includes('versailles') && 
       !locationLower.includes('montmartre'))) {
    logger.debug(`🎟️ [CalculateTickets] Location "${location}" doesn't require guide tickets`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // IMPORTANT: Track processed guides to avoid counting duplicates
  const processedGuideIds = new Set<string>();
  
  // Check if there are any assigned guides in the tour groups
  const hasAssignedGuides = tourGroups.some(group => group.guideId && group.guideId !== "unassigned");
  logger.debug(`🎟️ [CalculateTickets] Has assigned guides: ${hasAssignedGuides}`);
  
  // If no guides are assigned, don't count any guide tickets
  if (tourGroups.length > 0 && !hasAssignedGuides) {
    logger.debug(`🎟️ [CalculateTickets] No guides are assigned to groups, skipping ticket calculation`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Map actual assigned guides in groups to determine which guides are being used
  const assignedGuideIds = new Set<string>();
  tourGroups.forEach(group => {
    if (group.guideId && group.guideId !== "unassigned") {
      assignedGuideIds.add(group.guideId);
      logger.debug(`🎟️ [CalculateTickets] Found assigned guide in group: ${group.guideId}`);
    }
  });
  
  logger.debug(`🎟️ [CalculateTickets] Assigned guide IDs: ${Array.from(assignedGuideIds).join(', ')}`);

  // Log all assigned guides for clear debugging
  tourGroups.forEach((group, index) => {
    logger.debug(`🎟️ [CalculateTickets] Group ${index + 1} assignment:`, {
      groupId: group.id,
      groupName: group.name,
      guideId: group.guideId,
      isAssigned: group.guideId && group.guideId !== "unassigned"
    });
  });
  
  // Process guide1 only if they're actually assigned to a group
  if (guide1Info && guide1Info.id) {
    const isGuide1Assigned = assignedGuideIds.has("guide1") || assignedGuideIds.has(guide1Info.id);
    
    logger.debug(`🎟️ [CalculateTickets] Guide1 (${guide1Info.name}) assigned status: ${isGuide1Assigned}`);
    
    // Only process this guide if they're actually assigned
    if (isGuide1Assigned && !processedGuideIds.has(guide1Info.id)) {
      const { needsTicket, ticketType } = getGuideTicketRequirement(guide1Info, location);
      
      if (needsTicket) {
        if (ticketType === "adult") adultTickets++;
        if (ticketType === "child") childTickets++;
      }
      
      if (needsTicket) {
        guides.push({
          guideName: guide1Info.name || "Guide 1",
          guideType: String(guide1Info.guideType) || "Unknown",
          ticketType
        });
      }
      
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
  
  // Process guide2 only if they're actually assigned to a group
  if (guide2Info && guide2Info.id) {
    const isGuide2Assigned = assignedGuideIds.has("guide2") || assignedGuideIds.has(guide2Info.id);
    
    logger.debug(`🎟️ [CalculateTickets] Guide2 (${guide2Info.name}) assigned status: ${isGuide2Assigned}`);
    
    // Only process this guide if they're actually assigned
    if (isGuide2Assigned && !processedGuideIds.has(guide2Info.id)) {
      const { needsTicket, ticketType } = getGuideTicketRequirement(guide2Info, location);
      
      if (needsTicket) {
        if (ticketType === "adult") adultTickets++;
        if (ticketType === "child") childTickets++;
      }
      
      if (needsTicket) {
        guides.push({
          guideName: guide2Info.name || "Guide 2",
          guideType: String(guide2Info.guideType) || "Unknown",
          ticketType
        });
      }
      
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
  
  // Process guide3 only if they're actually assigned to a group
  if (guide3Info && guide3Info.id) {
    const isGuide3Assigned = assignedGuideIds.has("guide3") || assignedGuideIds.has(guide3Info.id);
    
    logger.debug(`🎟️ [CalculateTickets] Guide3 (${guide3Info.name}) assigned status: ${isGuide3Assigned}`);
    
    // Only process this guide if they're actually assigned
    if (isGuide3Assigned && !processedGuideIds.has(guide3Info.id)) {
      const { needsTicket, ticketType } = getGuideTicketRequirement(guide3Info, location);
      
      if (needsTicket) {
        if (ticketType === "adult") adultTickets++;
        if (ticketType === "child") childTickets++;
      }
      
      if (needsTicket) {
        guides.push({
          guideName: guide3Info.name || "Guide 3",
          guideType: String(guide3Info.guideType) || "Unknown",
          ticketType
        });
      }
      
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
    guidesWithTickets: guides.length,
    processedGuideIds: Array.from(processedGuideIds),
    guideDetails: guides.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType || 'No ticket'}`),
    assignedGuideIds: Array.from(assignedGuideIds)
  });
  
  return { 
    adultTickets, 
    childTickets, 
    guides 
  };
};
