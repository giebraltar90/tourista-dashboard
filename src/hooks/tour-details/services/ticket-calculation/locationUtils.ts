
import { logger } from "@/utils/logger";

/**
 * Determine if a location requires guide tickets
 * 
 * This function now always returns true as we want to calculate guide tickets
 * regardless of location
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  const normalizedLocation = location.trim().toLowerCase();
  
  // Log the location check for monitoring
  logger.debug(`🎟️ [LocationCheck] Location "${location}" now always requires guide tickets`, {
    normalizedLocation
  });
  
  // Always return true - we now want to calculate guide tickets for all locations
  return true;
};
