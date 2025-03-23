
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
  guideType: string;
  needsTicket: boolean;
  ticketType: "adult" | "child" | null;
} => {
  // If no guide info, no ticket needed
  if (!guideInfo) {
    logger.debug(`🎟️ [ProcessGuide] No guide info for ${guideKey}, no ticket needed`);
    return {
      guideInfo: null,
      guideName: `Unknown ${guideKey}`,
      guideType: "unknown",
      needsTicket: false,
      ticketType: null
    };
  }

  // Extract guide name and type for logging
  const guideName = guideInfo.name || guideKey;
  const guideType = guideInfo.guideType || "unknown";
  
  // Check if this guide is assigned to any groups
  const isAssigned = assignedGuideIds.has(guideKey);
  
  // Log guide details
  logger.debug(`🎟️ [ProcessGuide] Processing guide ${guideName} (${guideKey}):`, {
    guideType: guideInfo.guideType,
    isAssigned,
    assignedGuideIds: Array.from(assignedGuideIds),
    location
  });
  
  // If guide is not assigned to any groups, no ticket needed
  if (!isAssigned) {
    logger.debug(`🎟️ [ProcessGuide] Guide ${guideName} (${guideKey}) is not assigned to any groups, no ticket needed`);
    return {
      guideInfo,
      guideName,
      guideType,
      needsTicket: false,
      ticketType: null
    };
  }

  // Determine if guide needs a ticket based on type
  const needsTicket = guideTypeNeedsTicket(guideInfo.guideType);
  let ticketType: "adult" | "child" | null = null;
  
  if (needsTicket) {
    ticketType = determineTicketTypeForGuide(guideInfo.guideType);
    logger.debug(`🎟️ [ProcessGuide] ✅ Guide ${guideName} (${guideKey}) needs a ${ticketType} ticket`);
  } else {
    logger.debug(`🎟️ [ProcessGuide] ❌ Guide ${guideName} (${guideKey}) doesn't need a ticket due to guide type ${guideInfo.guideType}`);
  }
  
  return {
    guideInfo,
    guideName,
    guideType,
    needsTicket,
    ticketType
  };
};

// Update index exports to include this function
export const calculateGuideTickets = null; // This is a placeholder to address the missing export error
