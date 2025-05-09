
import { GuideInfo } from "@/types/ventrata";
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
  
  // If guide type contains "skip" or "no ticket", they don't need a ticket
  if (normalizedType.includes("skip") || normalizedType.includes("no ticket")) {
    logger.debug(`🎟️ [guideTypeNeedsTicket] Type "${guideType}" contains skip/no ticket - no ticket needed`);
    return false;
  }
  
  // If guide type contains "GA" (GA Free or GA Ticket), they need a ticket
  if (normalizedType.includes("ga")) {
    logger.debug(`🎟️ [guideTypeNeedsTicket] Type "${guideType}" contains GA - ticket needed`);
    return true;
  }
  
  // Special case for free tickets  
  if (normalizedType.includes("free")) {
    logger.debug(`🎟️ [guideTypeNeedsTicket] Type "${guideType}" contains free - ticket needed`);
    return true;
  }
  
  // Special case for known guide types that need tickets
  if (normalizedType === "guide" || normalizedType === "adult" || normalizedType === "child") {
    logger.debug(`🎟️ [guideTypeNeedsTicket] Type "${guideType}" is a standard guide type - ticket needed`);
    return true;
  }
  
  // If the guide type doesn't match any known types, log a warning and assume ticket needed
  logger.debug(`🎟️ [guideTypeNeedsTicket] Unknown guide type "${guideType}" - assuming ticket needed`);
  return true;
};

/**
 * Determine what type of ticket a guide needs (adult or child)
 * Accepts either a guide info object or just the guide type string
 */
export const determineTicketTypeForGuide = (guide: GuideInfo | string | null | undefined): "adult" | "child" | null => {
  // Extract the guide type string from either the guide object or use directly if it's a string
  const guideType = typeof guide === 'string' ? guide : guide?.guideType || '';
  
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
  if (normalizedType.includes("free") || normalizedType.includes("child")) {
    logger.debug(`🎟️ [determineTicketTypeForGuide] Type "${guideType}" needs a child ticket`);
    return "child";
  }
  
  // Guide types that need adult tickets - GA Ticket or just GA as default
  logger.debug(`🎟️ [determineTicketTypeForGuide] Type "${guideType}" needs an adult ticket`);
  return "adult";
};
