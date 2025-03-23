
import { logger } from "@/utils/logger";

/**
 * Determine if a location requires guide tickets
 * 
 * This function now always returns true as we want to calculate guide tickets
 * regardless of location
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  const normalizedLocation = location.trim().toLowerCase();
  
  // Special logging for tour #324598820
  if (location.includes('#324598820')) {
    logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Location check for ${location}:`, {
      normalizedLocation,
      result: true,
      reason: "All locations now require guide tickets per updated requirements"
    });
  } else {
    // Log the location check for monitoring
    logger.debug(`🎟️ [LocationCheck] Location "${location}" now always requires guide tickets`, {
      normalizedLocation
    });
  }
  
  // Always return true - we now want to calculate guide tickets for all locations
  return true;
};
