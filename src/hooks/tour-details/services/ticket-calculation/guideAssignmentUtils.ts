
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";

/**
 * Find which guides are assigned to groups
 */
export const findAssignedGuides = (
  tourGroups: any[] = [],
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
): Set<string> => {
  const assignedGuideIds = new Set<string>();
  
  tourGroups.forEach(group => {
    if (group.guideId && group.guideId !== "unassigned") {
      // Check if this guide matches one of our main guides
      if (guide1Info && (group.guideId === guide1Info.id || group.guideId === guide1Info.name || group.guideId === "guide1")) {
        assignedGuideIds.add("guide1");
        logger.debug(`🎟️ [FindAssignedGuides] Found guide1 assigned to group ${group.name || 'Unnamed'}`);
      }
      else if (guide2Info && (group.guideId === guide2Info.id || group.guideId === guide2Info.name || group.guideId === "guide2")) {
        assignedGuideIds.add("guide2");
        logger.debug(`🎟️ [FindAssignedGuides] Found guide2 assigned to group ${group.name || 'Unnamed'}`);
      }
      else if (guide3Info && (group.guideId === guide3Info.id || group.guideId === guide3Info.name || group.guideId === "guide3")) {
        assignedGuideIds.add("guide3");
        logger.debug(`🎟️ [FindAssignedGuides] Found guide3 assigned to group ${group.name || 'Unnamed'}`);
      }
    }
  });
  
  return assignedGuideIds;
};
