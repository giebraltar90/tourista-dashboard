
import { logger } from "@/utils/logger";
import { GuideInfo } from "@/types/ventrata";

/**
 * Determine if a guide type needs a ticket
 */
export const guideTypeNeedsTicket = (guideType?: string): boolean => {
  if (!guideType) {
    logger.debug("🎟️ [guideTypeNeedsTicket] No guide type provided, defaulting to ticket needed");
    return true;
  }
  
  // FIXED: Only 'GA Ticket' needs a ticket, not guide types just containing 'Ticket'
  const needsTicket = guideType === 'GA Ticket';
  logger.debug(`🎟️ [guideTypeNeedsTicket] Guide type "${guideType}" ${needsTicket ? 'needs' : 'does not need'} a ticket`);
  
  return needsTicket;
};

/**
 * Determine what type of ticket a guide needs based on their guide type
 */
export const determineTicketTypeForGuide = (guideType?: string): "adult" | "child" | null => {
  if (!guideType) {
    logger.debug("🎟️ [determineTicketTypeForGuide] No guide type provided, defaulting to adult ticket");
    return "adult";
  }
  
  if (!guideTypeNeedsTicket(guideType)) {
    logger.debug(`🎟️ [determineTicketTypeForGuide] Guide type "${guideType}" doesn't need a ticket`);
    return null;
  }
  
  // Child guides get child tickets, all others get adult tickets
  const isChildGuide = guideType.toLowerCase().includes('child');
  const ticketType = isChildGuide ? "child" : "adult";
  
  logger.debug(`🎟️ [determineTicketTypeForGuide] Guide type "${guideType}" needs ${ticketType} ticket`);
  return ticketType;
};
