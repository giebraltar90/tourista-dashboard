
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { guideTypeNeedsTicket, determineTicketTypeForGuide } from "./guideTypeUtils";

/**
 * Process a guide to determine if they need a ticket
 */
export const processGuideTicketRequirement = (
  guideInfo: GuideInfo | null,
  location: string,
  assignedGuides: Set<string>,
  guideId: string = ""
): {
  guideName: string;
  guideType: string;
  needsTicket: boolean;
  ticketType: "adult" | "child" | null;
  guideId: string;
} => {
  // Default values if no guide info is provided
  const defaultValues = {
    guideName: `Unknown ${guideId}`,
    guideType: "Unknown",
    needsTicket: false,
    ticketType: null as "adult" | "child" | null,
    guideId
  };
  
  // If guide info is null, they don't need a ticket
  if (!guideInfo) {
    logger.debug(`🎟️ [processGuideTicket] No guide info for ${guideId}, returning defaults`);
    return defaultValues;
  }
  
  // If guide is not assigned, they don't need a ticket
  if (!assignedGuides.has(guideId)) {
    logger.debug(`🎟️ [processGuideTicket] Guide ${guideInfo.name} (${guideId}) is not assigned, no ticket needed`);
    return {
      guideName: guideInfo.name,
      guideType: guideInfo.guideType,
      needsTicket: false,
      ticketType: null,
      guideId
    };
  }
  
  // Check if guide type needs a ticket
  const needsTicket = guideTypeNeedsTicket(guideInfo.guideType);
  
  // If guide doesn't need a ticket, return early
  if (!needsTicket) {
    logger.debug(`🎟️ [processGuideTicket] Guide ${guideInfo.name} (${guideId}) has type ${guideInfo.guideType} that doesn't need a ticket`);
    return {
      guideName: guideInfo.name,
      guideType: guideInfo.guideType,
      needsTicket: false,
      ticketType: null,
      guideId
    };
  }
  
  // Determine ticket type for the guide
  const ticketType = determineTicketTypeForGuide(guideInfo.guideType);
  
  logger.debug(`🎟️ [processGuideTicket] Guide ${guideInfo.name} (${guideId}) needs a ${ticketType} ticket`);
  
  return {
    guideName: guideInfo.name,
    guideType: guideInfo.guideType,
    needsTicket: true,
    ticketType,
    guideId
  };
};
