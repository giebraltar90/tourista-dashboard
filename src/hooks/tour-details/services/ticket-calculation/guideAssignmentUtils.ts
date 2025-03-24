
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { determineTicketTypeForGuide } from "./guideTypeUtils";

/**
 * Find which guides are assigned to groups for this tour
 * We now assume all guides need tickets if they're present
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
  
  // Determine ticket type based on guide info
  const ticketType = determineTicketTypeForGuide(guideInfo);
  
  logger.debug(`🎟️ [getGuideTicketRequirement] Guide ${guideInfo.name} (${guidePosition}) needs ${ticketType ? `a ${ticketType} ticket` : 'no ticket'}`);
  return { ticketType, guideInfo };
};
