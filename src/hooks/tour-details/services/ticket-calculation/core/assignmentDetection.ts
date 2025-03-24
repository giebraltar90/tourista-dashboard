
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { guideTypeNeedsTicket } from "../guideTypeUtils";

/**
 * Determine if a guide is the default guide for a tour
 */
export const isDefaultGuide = (
  guideInfo: GuideInfo | null,
  locationRequiresTickets: boolean
): boolean => {
  // No guide info means it's not a default guide
  if (!guideInfo) {
    return false;
  }
  
  // If location doesn't require tickets, we don't need a default guide
  if (!locationRequiresTickets) {
    return false;
  }
  
  // Check if the guide type needs a ticket
  const needsTicket = guideTypeNeedsTicket(guideInfo.guideType);
  
  // For a guide to be considered the default, they must have a name and need a ticket
  const result = needsTicket && !!guideInfo.name;
  
  logger.debug(`🎟️ [isDefaultGuide] Guide ${guideInfo.name || 'unknown'} is ${result ? '' : 'not '}a default guide:`, {
    guideType: guideInfo.guideType,
    needsTicket,
    hasName: !!guideInfo.name
  });
  
  return result;
};

/**
 * Process the default guide for the tour
 */
export const processDefaultGuide = (
  guideInfo: GuideInfo | null,
  locationRequiresTickets: boolean,
  guideKey: string,
  processorFn: any
): any => {
  // If location doesn't require tickets, no tickets needed
  if (!locationRequiresTickets) {
    return null;
  }
  
  // No guide info, no ticket
  if (!guideInfo) {
    return null;
  }
  
  // Create a default set with just this guide
  const defaultSet = new Set<string>([guideKey]);
  
  // Process the guide using the provided processor function
  return processorFn(guideInfo, "", defaultSet, guideKey);
};
