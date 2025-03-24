
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";

/**
 * Find which guides are assigned to groups for this tour
 */
export const findAssignedGuides = (
  tourGroups: any[] = [],
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
): Set<string> => {
  const assignedGuideIds = new Set<string>();
  
  // Add all available guides by default
  if (guide1Info) assignedGuideIds.add("guide1");
  if (guide2Info) assignedGuideIds.add("guide2");
  if (guide3Info) assignedGuideIds.add("guide3");
  
  // Log the results
  logger.debug(`🎟️ [findAssignedGuides] Found ${assignedGuideIds.size} assigned guides:`, {
    assignedGuidePositions: Array.from(assignedGuideIds),
    guide1: guide1Info?.name || 'none',
    guide2: guide2Info?.name || 'none',
    guide3: guide3Info?.name || 'none'
  });
  
  return assignedGuideIds;
};

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
