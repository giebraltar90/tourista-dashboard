
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { locationRequiresGuideTickets } from "./locationUtils";
import { guideTypeNeedsTicket, determineTicketTypeForGuide } from "./guideTypeUtils";

/**
 * Process whether a guide needs a ticket
 */
export const processGuideTicketRequirement = (
  guideInfo: GuideInfo | null,
  location: string = "",
  assignedGuideIds: Set<string>,
  guideKey: string
): {
  guideInfo: GuideInfo | null;
  guideName: string;
  needsTicket: boolean;
  ticketType: "adult" | "child" | null;
} => {
  // If no guide info, no ticket needed
  if (!guideInfo) {
    logger.debug(`🎟️ [ProcessGuide] No guide info for ${guideKey}, no ticket needed`);
    return {
      guideInfo: null,
      guideName: `Unknown ${guideKey}`,
      needsTicket: false,
      ticketType: null
    };
  }

  // Extract guide name for logging
  const guideName = guideInfo.name || guideKey;
  
  // Check if this guide is assigned to any groups
  const isAssigned = assignedGuideIds.has(guideKey);
  
  // Log guide details
  logger.debug(`🎟️ [ProcessGuide] Processing guide ${guideName} (${guideKey}):`, {
    guideType: guideInfo.guideType,
    isAssigned,
    assignedGuideIds: Array.from(assignedGuideIds)
  });
  
  // If guide is not assigned to any groups, no ticket needed
  if (!isAssigned) {
    logger.debug(`🎟️ [ProcessGuide] Guide ${guideName} (${guideKey}) is not assigned to any groups`);
    return {
      guideInfo,
      guideName,
      needsTicket: false,
      ticketType: null
    };
  }
  
  // Check if location requires tickets
  if (!locationRequiresGuideTickets(location)) {
    logger.debug(`🎟️ [ProcessGuide] Location "${location}" doesn't require guide tickets`);
    return {
      guideInfo,
      guideName,
      needsTicket: false,
      ticketType: null
    };
  }

  // Log guide type for debugging
  logger.debug(`🎟️ [ProcessGuide] Checking ticket requirement for ${guideName} (${guideKey}) with type: ${guideInfo.guideType}`);
  
  // Determine if guide needs a ticket based on type
  const needsTicket = guideTypeNeedsTicket(guideInfo.guideType);
  let ticketType = null;
  
  if (needsTicket) {
    ticketType = determineTicketTypeForGuide(guideInfo.guideType);
    logger.debug(`🎟️ [ProcessGuide] ✅ Guide ${guideName} (${guideKey}) needs a ${ticketType} ticket`);
  } else {
    logger.debug(`🎟️ [ProcessGuide] ❌ Guide ${guideName} (${guideKey}) doesn't need a ticket due to guide type ${guideInfo.guideType}`);
  }
  
  return {
    guideInfo,
    guideName,
    needsTicket,
    ticketType
  };
};

/**
 * Calculate total tickets needed from guide requirements
 */
export const calculateGuideTickets = (
  guideRequirements: Array<{
    guideInfo: GuideInfo | null;
    guideName: string;
    needsTicket: boolean;
    ticketType: "adult" | "child" | null;
  }>
): {
  adultTickets: number;
  childTickets: number;
  guides: Array<{
    guideName: string;
    guideType: string;
    ticketType: string | null;
  }>;
} => {
  // Log full guide requirements
  logger.debug(`🎟️ [CalculateTickets] Processing ${guideRequirements.length} guides for tickets:`, 
    guideRequirements.map(guide => ({
      name: guide.guideName,
      needsTicket: guide.needsTicket,
      ticketType: guide.ticketType,
      type: guide.guideInfo?.guideType || 'unknown'
    }))
  );

  // Count tickets by type
  let adultTickets = 0;
  let childTickets = 0;
  
  // Process each guide that needs a ticket for the result
  const guidesWithTickets = guideRequirements
    .filter(guide => guide.needsTicket && guide.guideInfo)
    .map(guide => {
      if (guide.ticketType === "adult") {
        adultTickets++;
      } else if (guide.ticketType === "child") {
        childTickets++;
      }
      
      return {
        guideName: guide.guideName,
        guideType: guide.guideInfo?.guideType || "Unknown",
        ticketType: guide.ticketType
      };
    });
    
  // Log the result
  logger.debug(`🎟️ [CalculateTickets] Final guide ticket counts:`, {
    adultTickets,
    childTickets,
    totalTickets: adultTickets + childTickets,
    guidesWithTickets: guidesWithTickets.length,
    guideDetails: guidesWithTickets.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType || 'No ticket'}`)
  });
  
  return {
    adultTickets,
    childTickets,
    guides: guidesWithTickets
  };
};
