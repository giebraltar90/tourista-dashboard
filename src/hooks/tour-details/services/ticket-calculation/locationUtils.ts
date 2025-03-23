
import { logger } from "@/utils/logger";

/**
 * Determines if a tour location requires guide tickets
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  if (!location) {
    logger.debug(`🎟️ [locationUtils] Empty location, assuming no guide tickets required`);
    return false;
  }
  
  // Normalize the location
  const normalizedLocation = location.toLowerCase().trim();
  
  // List of locations that require guide tickets
  const locationsRequiringGuideTickets = [
    "versailles",
    "montmartre",
    "louvre",
    "musée d'orsay",
    "orsay",
    "musee d'orsay"
  ];
  
  // Check if location matches any in our list
  for (const ticketLocation of locationsRequiringGuideTickets) {
    if (normalizedLocation.includes(ticketLocation)) {
      logger.debug(`🎟️ [locationUtils] Location "${location}" requires guide tickets (matched "${ticketLocation}")`);
      return true;
    }
  }
  
  logger.debug(`🎟️ [locationUtils] Location "${location}" does not require guide tickets`);
  return false;
};
