
import { logger } from "@/utils/logger";

/**
 * Determines if a tour location requires guide tickets
 * Based on updated requirements: location no longer matters for guide tickets
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  // No need to check location per updated requirements
  // Always return true since now we only check the guide type
  logger.debug(`🎟️ [locationUtils] Location no longer determines ticket requirements, always returning true`);
  return true;
};
