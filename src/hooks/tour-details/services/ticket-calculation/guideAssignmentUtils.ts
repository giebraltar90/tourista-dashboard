
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { determineTicketTypeForGuide } from "./guideTypeUtils";

/**
 * Find which guides are assigned to groups for this tour
 * We now check both tour groups and primary guides
 */
export const findAssignedGuides = (
  tourGroups: any[] = [],
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
): Set<string> => {
  const assignedGuideIds = new Set<string>();
  
  // Check if groups have assigned guides
  if (Array.isArray(tourGroups) && tourGroups.length > 0) {
    tourGroups.forEach(group => {
      if (group.guideId === "guide1") assignedGuideIds.add("guide1");
      if (group.guideId === "guide2") assignedGuideIds.add("guide2");
      if (group.guideId === "guide3") assignedGuideIds.add("guide3");
    });
  }
  
  // If no guides are assigned to groups, but we have primary guides available,
  // consider the first available guide as assigned (this matches original behavior)
  if (assignedGuideIds.size === 0) {
    // Only add primary guides that exist
    if (guide1Info && guide1Info.name) assignedGuideIds.add("guide1");
    else if (guide2Info && guide2Info.name) assignedGuideIds.add("guide2");
    else if (guide3Info && guide3Info.name) assignedGuideIds.add("guide3");
  }
  
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
