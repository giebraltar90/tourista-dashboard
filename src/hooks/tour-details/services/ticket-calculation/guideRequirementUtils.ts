
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { locationRequiresGuideTickets } from "./locationUtils";
import { guideTypeNeedsTicket, determineTicketTypeForGuide } from "./guideTypeUtils";

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
