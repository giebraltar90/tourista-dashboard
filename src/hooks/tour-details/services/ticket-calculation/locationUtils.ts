
import { logger } from "@/utils/logger";

/**
 * Determine if a location requires guide tickets
 * IMPORTANT UPDATE: All locations now require guide tickets per latest requirements
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  // For special debug logging
  if (location.includes("#324598820")) {
    logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Location check will return TRUE`);
  }
  
  // Instead of checking location, all locations now require guide tickets
  return true;
};
