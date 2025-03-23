
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { Set } from "typescript";

/**
 * Helper function to detect if a guide is the default guide for a tour
 * when no guides are explicitly assigned
 */
export const isDefaultGuide = (
  guideInfo: GuideInfo | null,
  locationRequiresTickets: boolean
): boolean => {
  if (!guideInfo) return false;
  
  // If location requires tickets and we have guide info, consider as default
  return locationRequiresTickets && !!guideInfo;
};

/**
 * Process a single guide when no guides are assigned
 * Used when there are no explicit guide assignments but we still need tickets
 */
export const processDefaultGuide = (
  guideInfo: GuideInfo | null, 
  locationRequiresTickets: boolean,
  guidePosition: string,
  processGuideFn: (
    guideInfo: GuideInfo | null,
    location: string,
    assignedGuideIds: Set<string>,
    guideKey: string
  ) => any
): any | null => {
  
  if (!guideInfo || !locationRequiresTickets) {
    logger.debug(`🎟️ [DefaultGuide] No guide info or location doesn't require tickets`);
    return null;
  }
  
  logger.debug(`🎟️ [DefaultGuide] Processing default guide:`, {
    guideName: guideInfo.name,
    guideType: guideInfo.guideType,
    position: guidePosition
  });
  
  // Create a mock assignment set with just this guide
  const mockAssignments = new Set([guidePosition]);
  
  // Use the standard processing function with the mock assignments
  return processGuideFn(
    guideInfo, 
    "default", // Use a default location value 
    mockAssignments, 
    guidePosition
  );
};
