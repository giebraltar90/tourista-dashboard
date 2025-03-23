
import { logger } from "@/utils/logger";

/**
 * Determines if a tour location requires guide tickets
 * Based on updated requirements: location no longer matters for guide tickets
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  // Always return true since location doesn't matter anymore, we only check the guide type
  logger.debug(`🎟️ [locationUtils] Location no longer affects ticket requirements, always returning true`);
  return true;
};
