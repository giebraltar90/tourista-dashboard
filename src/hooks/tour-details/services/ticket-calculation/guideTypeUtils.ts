
import { logger } from "@/utils/logger";

/**
 * Determine if a guide type needs a ticket
 */
export const guideTypeNeedsTicket = (guideType: string = ""): boolean => {
  // Normalize the guide type
  const normalizedType = guideType?.toLowerCase().trim() || "";
  
  // Debug the guide type being evaluated
  logger.debug(`🎟️ [guideTypeNeedsTicket] Checking guide type: "${guideType}"`);

  // Guide types that don't need tickets
  const noTicketTypes = [
    "gc",
    "guide coordinator",
    "coordinator",
    "trainee", 
    "guide trainee",
    "intern",
    "guide intern"
  ];
  
  // Guide types that need tickets
  const needsTicketTypes = [
    "ga ticket",
    "ga free",
    "guide", 
    "guide assistant",
    "assistant",
    "ga",
    "standard",
    "regular"
  ];
  
  // If the type explicitly doesn't need a ticket
  for (const type of noTicketTypes) {
    if (normalizedType.includes(type)) {
      logger.debug(`🎟️ [guideTypeNeedsTicket] Type "${guideType}" matched no-ticket type "${type}"`);
      return false;
    }
  }
  
  // If the type explicitly needs a ticket
  for (const type of needsTicketTypes) {
    if (normalizedType.includes(type)) {
      logger.debug(`🎟️ [guideTypeNeedsTicket] Type "${guideType}" matched ticket-needed type "${type}"`);
      return true;
    }
  }
  
  // Default case - log the unknown type and return conservative true (needs ticket)
  logger.debug(`🎟️ [guideTypeNeedsTicket] Unknown guide type "${guideType}", defaulting to needs ticket`);
  return true;
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
  
  // Guide types that need child tickets
  const childTicketTypes = [
    "ga free",
    "free",
    "junior",
    "child",
    "student"
  ];
  
  // Check for child ticket types
  for (const type of childTicketTypes) {
    if (normalizedType.includes(type)) {
      logger.debug(`🎟️ [determineTicketTypeForGuide] Type "${guideType}" needs a child ticket`);
      return "child";
    }
  }
  
  // Default to adult ticket if guide needs a ticket but doesn't match any child ticket types
  logger.debug(`🎟️ [determineTicketTypeForGuide] Type "${guideType}" needs an adult ticket`);
  return "adult";
};
