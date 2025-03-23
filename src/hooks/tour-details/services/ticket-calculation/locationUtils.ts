
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
    'sistine chapel'
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
