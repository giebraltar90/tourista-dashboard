
import { logger } from "@/utils/logger";

/**
 * Determine if a guide type needs a ticket
 */
export const guideTypeNeedsTicket = (guideType: string = ""): boolean => {
  // Normalize the guide type
  const normalizedType = guideType?.toLowerCase().trim() || "";
  
  // Debug the guide type being evaluated
  logger.debug(`🎟️ [guideTypeNeedsTicket] Checking guide type: "${guideType}"`);

  // If the guide type is "GC", they don't need a ticket
  if (normalizedType === "gc") {
    logger.debug(`🎟️ [guideTypeNeedsTicket] Type "${guideType}" is GC - no ticket needed`);
    return false;
  }
  
  // If guide type contains "GA" (GA Free or GA Ticket), they need a ticket
  if (normalizedType.includes("ga")) {
    logger.debug(`🎟️ [guideTypeNeedsTicket] Type "${guideType}" contains GA - ticket needed`);
    return true;
  }
  
  // If the guide type doesn't match any known types, log a warning and assume no ticket needed
  logger.debug(`🎟️ [guideTypeNeedsTicket] Unknown guide type "${guideType}" - assuming no ticket needed`);
  return false;
};

/**
 * Determine what type of ticket a guide needs (adult or child)
 */
export const determineTicketTypeForGuide = (guideType: string = ""): "adult" | "child" | null => {
  // Normalize the guide type
  const normalizedType = guideType?.toLowerCase().trim() || "";
  
  // Debug the guide type being evaluated
  logger.debug(`🎟️ [determineTicketTypeForGuide] Determining ticket type for guide type: "${guideType}"`);
  
  // If guide doesn't need a ticket
  if (!guideTypeNeedsTicket(guideType)) {
    logger.debug(`🎟️ [determineTicketTypeForGuide] Guide type "${guideType}" doesn't need a ticket`);
    return null;
  }
  
  // Guide types that need child tickets - GA Free or contains 'free'
  if (normalizedType.includes("free")) {
    logger.debug(`🎟️ [determineTicketTypeForGuide] Type "${guideType}" needs a child ticket`);
    return "child";
  }
  
  // Guide types that need adult tickets - GA Ticket or just GA as default
  logger.debug(`🎟️ [determineTicketTypeForGuide] Type "${guideType}" needs an adult ticket`);
  return "adult";
};
