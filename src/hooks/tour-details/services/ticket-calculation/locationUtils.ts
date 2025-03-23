
import { logger } from "@/utils/logger";

/**
 * Determine if a location requires guide tickets
 * 
 * This function checks if the given location requires guides to have tickets
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  const normalizedLocation = location.trim().toLowerCase();
  
  // Specific locations that DO NOT require guide tickets
  const excludedLocations = [
    'louvre', 
    'paris', 
    'colosseum',
    'rome',
    'versailles',
    'vatican',
    'sistine chapel',
    'tour eiffel',  // Adding more common locations that shouldn't need guide tickets
    'eiffel',
    'notre dame',
    'montmartre'
  ];
  
  const requiresTickets = !excludedLocations.some(
    excluded => normalizedLocation.includes(excluded)
  );
  
  logger.debug(`🎟️ [LocationCheck] Location "${location}" requires guide tickets: ${requiresTickets}`, {
    normalizedLocation,
    excludedLocations,
    requiresTickets
  });
  
  return requiresTickets;
};

/**
 * Special override function to handle problematic tour IDs
 * This is used to fix specific tour tickets issues
 */
export const shouldOverrideGuideTickets = (tourId: string): boolean => {
  // List of tour IDs that should never have guide tickets regardless of location
  const noTicketsTourIds = [
    '313922567',  // Specified as not needing guide tickets
    '324598761'   // Specified as not needing guide tickets
  ];
  
  if (noTicketsTourIds.includes(tourId)) {
    logger.debug(`🎟️ [TicketOverride] Tour ${tourId} has a manual override: NO GUIDE TICKETS`);
    return true;
  }
  
  return false;
};
