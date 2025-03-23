
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { determineTicketTypeForGuide } from "./guideTypeUtils";

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
  
  // Ensure tour groups is an array
  if (!Array.isArray(tourGroups)) {
    logger.debug(`🎟️ [findAssignedGuides] tourGroups is not an array, skipping assignment check`);
    return assignedGuideIds;
  }
  
  // Log input data for debugging
  logger.debug(`🎟️ [findAssignedGuides] Checking ${tourGroups.length} groups for assigned guides`, {
    guide1: guide1Info?.name || 'none',
    guide2: guide2Info?.name || 'none',
    guide3: guide3Info?.name || 'none'
  });
  
  // Add all available guides (assume they're assigned if present)
  if (guide1Info) assignedGuideIds.add("guide1");
  if (guide2Info) assignedGuideIds.add("guide2");
  if (guide3Info) assignedGuideIds.add("guide3");
  
  // For logging: collect guide info for assigned guides
  const assignedGuides: Array<{id: string, position: string, name: string}> = [];
  
  if (guide1Info) {
    assignedGuides.push({
      id: guide1Info.id || "guide1",
      position: "guide1",
      name: guide1Info.name || "Guide 1"
    });
  }
  
  if (guide2Info) {
    assignedGuides.push({
      id: guide2Info.id || "guide2",
      position: "guide2",
      name: guide2Info.name || "Guide 2"
    });
  }
  
  if (guide3Info) {
    assignedGuides.push({
      id: guide3Info.id || "guide3",
      position: "guide3",
      name: guide3Info.name || "Guide 3"
    });
  }
  
  // Log the results
  logger.debug(`🎟️ [findAssignedGuides] Found ${assignedGuideIds.size} assigned guides:`, {
    assignedGuidePositions: Array.from(assignedGuideIds),
    guideDetails: assignedGuides
  });
  
  return assignedGuideIds;
};

/**
 * Get ticket requirement for a specific guide
 */
export const getGuideTicketRequirement = (
  guidePosition: string,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
): { ticketType: "adult" | "child" | null, guideInfo: GuideInfo | null } => {
  let guideInfo: GuideInfo | null = null;
  
  // Match guide position to the correct guide info
  if (guidePosition === "guide1") {
    guideInfo = guide1Info;
  } else if (guidePosition === "guide2") {
    guideInfo = guide2Info;
  } else if (guidePosition === "guide3") {
    guideInfo = guide3Info;
  }
  
  // If we don't have guide info, return null ticket type
  if (!guideInfo) {
    logger.debug(`🎟️ [getGuideTicketRequirement] No guide info for ${guidePosition}, returning null ticket type`);
    return { ticketType: null, guideInfo: null };
  }
  
  // Determine ticket type based on guide type
  const ticketType = determineTicketTypeForGuide(guideInfo.guideType);
  
  logger.debug(`🎟️ [getGuideTicketRequirement] Guide ${guideInfo.name} (${guidePosition}) needs ${ticketType ? `a ${ticketType} ticket` : 'no ticket'}`);
  return { ticketType, guideInfo };
};
