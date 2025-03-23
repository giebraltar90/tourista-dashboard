
import { logger } from "@/utils/logger";

/**
 * Determine if a guide needs a ticket based on their guide type
 */
export const guideTypeNeedsTicket = (guideType: string = ""): boolean => {
  // Normalize guide type by trimming and converting to lowercase
  const normalizedType = guideType?.trim().toLowerCase() || "";
  
  // Logging for debugging
  logger.debug(`🎟️ [guideTypeNeedsTicket] Checking guide type "${guideType}"`);
  
  // Guide types that never need tickets
  const noTicketTypes = [
    "gc", "gc guide", "guide coordinator",
    "guide coordinator",
    "coordinator"
  ];
  
  // Guide types that always need tickets
  const ticketTypes = [
    "ga ticket", "ga tickets", "guide assistant",
    "guide assistant ticket", "ticket guide",
    "ga", "guide assistant"
  ];
  
  // Check if guide type is in the no-ticket list
  const isNoTicketType = noTicketTypes.some(type => 
    normalizedType.includes(type)
  );
  
  // Check if guide type is in the needs-ticket list
  const isTicketType = ticketTypes.some(type => 
    normalizedType.includes(type)
  );
  
  // If explicitly no ticket, return false
  if (isNoTicketType) {
    logger.debug(`🎟️ [guideTypeNeedsTicket] Guide type "${guideType}" is explicitly NO ticket type (GC)`);
    return false;
  }
  
  // If explicitly ticket type, return true
  if (isTicketType) {
    logger.debug(`🎟️ [guideTypeNeedsTicket] Guide type "${guideType}" is explicitly ticket type (GA Ticket)`);
    return true;
  }
  
  // Default case: if contains "free" (case insensitive), it needs a ticket
  // GA Free is a child ticket
  const needsTicket = normalizedType.includes("free");
  
  logger.debug(`🎟️ [guideTypeNeedsTicket] Guide type "${guideType}" checked:`, {
    normalizedType,
    isNoTicketType,
    isTicketType,
    containsFree: normalizedType.includes("free"),
    needsTicket
  });
  
  return needsTicket;
};

/**
 * Determine what type of ticket a guide needs (adult or child)
 */
export const determineTicketTypeForGuide = (guideType: string = ""): "adult" | "child" | null => {
  // Normalize guide type
  const normalizedType = guideType?.trim().toLowerCase() || "";
  
  // Log the input for debugging
  logger.debug(`🎟️ [determineTicketTypeForGuide] Determining ticket type for "${guideType}"`);
  
  // First check if guide needs ticket at all
  if (!guideTypeNeedsTicket(guideType)) {
    logger.debug(`🎟️ [determineTicketTypeForGuide] Guide type "${guideType}" doesn't need a ticket`);
    return null;
  }
  
  // If type contains "free" (case insensitive), it's a child ticket
  // Otherwise it's an adult ticket
  const isChildTicket = normalizedType.includes("free");
  const ticketType = isChildTicket ? "child" : "adult";
  
  logger.debug(`🎟️ [determineTicketTypeForGuide] Guide type "${guideType}" needs ${ticketType} ticket`, {
    normalizedType,
    isChildTicket,
    ticketType
  });
  
  return ticketType;
};
