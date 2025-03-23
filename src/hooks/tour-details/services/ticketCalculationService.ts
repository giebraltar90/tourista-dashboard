
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { GuideTicketRequirement, GuideTicketCounts } from "../utils/guideTicketTypes";

/**
 * Check if a location requires guide tickets
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  // Normalize location to lowercase for case-insensitive comparison
  const locationLower = (location || '').toLowerCase().trim();
  
  return locationLower.includes('versailles') || 
         locationLower.includes('versaille') || // Common misspelling
         locationLower.includes('montmartre');
};

/**
 * Check if a guide's type indicates they need a ticket
 */
export const guideTypeNeedsTicket = (guideType: string = ""): boolean => {
  // Normalize guide type to uppercase for consistent comparison
  const guideTypeUpper = (guideType || "").toUpperCase();
  
  // GC guides never need tickets
  if (guideTypeUpper === "GC") {
    return false;
  }
  
  // All other guide types need tickets
  return true;
};

/**
 * Determine the ticket type needed based on guide type
 */
export const determineTicketTypeForGuide = (guideType: string = ""): "adult" | "child" | null => {
  // Normalize guide type to uppercase for consistent comparison
  const guideTypeUpper = (guideType || "").toUpperCase();
  
  // GC guides don't need tickets
  if (guideTypeUpper === "GC") {
    return null;
  }
  
  // GA Free (under 26) guides need child tickets
  if (guideTypeUpper.includes("FREE") || 
      guideTypeUpper.includes("UNDER") || 
      guideTypeUpper.includes("U26")) {
    return "child";
  }
  
  // GA Ticket (over 26) guides and others need adult tickets
  return "adult";
};

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
  
  // Check if location requires tickets
  if (!locationRequiresGuideTickets(location)) {
    logger.debug(`🎟️ [TicketRequirement] Location "${location}" doesn't require guide tickets`);
    return { needsTicket: false, ticketType: null };
  }

  // Determine if guide needs a ticket based on type
  const needsTicket = guideTypeNeedsTicket(guideInfo.guideType);
  const ticketType = determineTicketTypeForGuide(guideInfo.guideType);
  
  // Log the result
  if (needsTicket) {
    logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} needs a ${ticketType} ticket`);
  } else {
    logger.debug(`🎟️ [TicketRequirement] Guide ${guideInfo.name} doesn't need a ticket`);
  }
  
  return { needsTicket, ticketType };
};

/**
 * Find which guides are assigned to groups
 */
export const findAssignedGuides = (
  tourGroups: any[] = [],
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
): Set<string> => {
  const assignedGuideIds = new Set<string>();
  
  tourGroups.forEach(group => {
    if (group.guideId && group.guideId !== "unassigned") {
      // Check if this guide matches one of our main guides
      if (guide1Info && (group.guideId === guide1Info.id || group.guideId === guide1Info.name || group.guideId === "guide1")) {
        assignedGuideIds.add("guide1");
        logger.debug(`🎟️ [FindAssignedGuides] Found guide1 assigned to group ${group.name || 'Unnamed'}`);
      }
      else if (guide2Info && (group.guideId === guide2Info.id || group.guideId === guide2Info.name || group.guideId === "guide2")) {
        assignedGuideIds.add("guide2");
        logger.debug(`🎟️ [FindAssignedGuides] Found guide2 assigned to group ${group.name || 'Unnamed'}`);
      }
      else if (guide3Info && (group.guideId === guide3Info.id || group.guideId === guide3Info.name || group.guideId === "guide3")) {
        assignedGuideIds.add("guide3");
        logger.debug(`🎟️ [FindAssignedGuides] Found guide3 assigned to group ${group.name || 'Unnamed'}`);
      }
    }
  });
  
  return assignedGuideIds;
};

/**
 * Process a single guide's ticket requirements
 */
export const processGuideTicketRequirement = (
  guideInfo: GuideInfo | null,
  location: string,
  assignedGuideIds: Set<string>,
  guideKey: string
): GuideTicketRequirement & { needsTicket: boolean; ticketType: "adult" | "child" | null } => {
  // Skip if guide info is missing or guide is not assigned
  if (!guideInfo || !assignedGuideIds.has(guideKey)) {
    return { 
      needsTicket: false, 
      ticketType: null, 
      guideName: guideInfo?.name || "",
      guideInfo: null
    };
  }
  
  logger.debug(`🎟️ [ProcessGuide] Processing assigned ${guideKey} (${guideInfo.name})`);
  
  const { needsTicket, ticketType } = getGuideTicketRequirement(guideInfo, location);
  
  return { 
    needsTicket, 
    ticketType,
    guideName: guideInfo.name || `Guide ${guideKey.replace('guide', '')}`,
    guideInfo,
  };
};

/**
 * Calculate total tickets needed for assigned guides
 */
export const calculateGuideTickets = (
  guideRequirements: Array<GuideTicketRequirement & { needsTicket: boolean; ticketType: "adult" | "child" | null }>
): { adultTickets: number; childTickets: number; guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> } => {
  let adultTickets = 0;
  let childTickets = 0;
  const guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> = [];
  
  guideRequirements.forEach(guide => {
    if (guide.needsTicket) {
      if (guide.ticketType === "adult") adultTickets++;
      if (guide.ticketType === "child") childTickets++;
      
      if (guide.guideInfo) {
        guides.push({
          guideName: guide.guideName,
          guideType: String(guide.guideInfo.guideType) || "Unknown",
          ticketType: guide.ticketType
        });
      }
    }
  });
  
  return { adultTickets, childTickets, guides };
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
  // Skip ticket calculation if location doesn't require tickets
  if (!locationRequiresGuideTickets(location)) {
    logger.debug(`🎟️ [CalculateTickets] Location "${location}" doesn't require guide tickets`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Find assigned guides
  const assignedGuideIds = findAssignedGuides(tourGroups, guide1Info, guide2Info, guide3Info);
  logger.debug(`🎟️ [CalculateTickets] Found assigned guides: ${Array.from(assignedGuideIds).join(', ') || 'none'}`);
  
  if (assignedGuideIds.size === 0) {
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Process each guide
  const guide1Result = processGuideTicketRequirement(guide1Info, location, assignedGuideIds, "guide1");
  const guide2Result = processGuideTicketRequirement(guide2Info, location, assignedGuideIds, "guide2");
  const guide3Result = processGuideTicketRequirement(guide3Info, location, assignedGuideIds, "guide3");
  
  // Calculate total tickets needed
  const result = calculateGuideTickets([guide1Result, guide2Result, guide3Result]);
  
  // Final count check
  logger.debug("🎟️ [CalculateTickets] Final guide ticket counts", {
    adultTickets: result.adultTickets,
    childTickets: result.childTickets,
    guidesWithTickets: result.guides.length,
    assignedGuideCount: assignedGuideIds.size,
    guideDetails: result.guides.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType || 'No ticket'}`)
  });
  
  return result;
};

/**
 * Calculate complete ticket requirements for guides including counts
 */
export const calculateCompleteGuideTicketRequirements = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string,
  tourGroups: any[]
): GuideTicketCounts => {
  // First determine if tickets are needed at all
  const needsGuideTickets = locationRequiresGuideTickets(location);
  
  if (!needsGuideTickets) {
    return {
      adultTickets: 0,
      childTickets: 0,
      totalTickets: 0,
      guides: []
    };
  }
  
  // Find which guides are assigned
  const assignedGuideIds = findAssignedGuides(tourGroups, guide1Info, guide2Info, guide3Info);
  
  if (assignedGuideIds.size === 0) {
    return {
      adultTickets: 0,
      childTickets: 0,
      totalTickets: 0,
      guides: []
    };
  }
  
  // Calculate requirements for each guide
  const guide1Req = processGuideTicketRequirement(guide1Info, location, assignedGuideIds, "guide1");
  const guide2Req = processGuideTicketRequirement(guide2Info, location, assignedGuideIds, "guide2");
  const guide3Req = processGuideTicketRequirement(guide3Info, location, assignedGuideIds, "guide3");
  
  // Filter to only guides that need tickets
  const guidesWithRequirements: GuideTicketRequirement[] = [
    guide1Req, guide2Req, guide3Req
  ].filter(g => g.needsTicket).map(g => ({
    guideName: g.guideName,
    guideInfo: g.guideInfo,
    needsTicket: g.needsTicket,
    ticketType: g.ticketType
  }));
  
  // Count tickets by type
  let adultTickets = 0;
  let childTickets = 0;
  
  guidesWithRequirements.forEach(guide => {
    if (guide.ticketType === 'adult') adultTickets++;
    else if (guide.ticketType === 'child') childTickets++;
  });
  
  return {
    adultTickets,
    childTickets,
    totalTickets: adultTickets + childTickets,
    guides: guidesWithRequirements
  };
};
