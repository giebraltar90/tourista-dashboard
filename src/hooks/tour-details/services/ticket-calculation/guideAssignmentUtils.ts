
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
  
  // Ensure tour groups is an array
  if (!Array.isArray(tourGroups)) {
    logger.debug(`🎟️ [findAssignedGuides] tourGroups is not an array, skipping assignment check`);
    return assignedGuideIds;
  }
  
  // Build a map of guide IDs to their position (guide1, guide2, guide3)
  const guideMap = new Map<string, string>();
  
  if (guide1Info?.id) guideMap.set(guide1Info.id, "guide1");
  if (guide2Info?.id) guideMap.set(guide2Info.id, "guide2");
  if (guide3Info?.id) guideMap.set(guide3Info.id, "guide3");
  
  // For logging: collect guide info for assigned guides
  const assignedGuides: Array<{id: string, position: string, name: string}> = [];
  
  // Check each group to see if it has a guide assigned
  for (const group of tourGroups) {
    if (!group) continue;
    
    const guideId = group.guideId || group.guide_id;
    
    if (guideId && guideId !== "unassigned") {
      // Is this a guide we know about?
      const guidePosition = guideMap.get(guideId);
      
      if (guidePosition) {
        assignedGuideIds.add(guidePosition);
        
        // Add to our logging collection
        assignedGuides.push({
          id: guideId,
          position: guidePosition,
          name: group.guideName || "Unknown"
        });
      } else {
        // This is a guide we don't know about, but they're still assigned
        logger.debug(`🎟️ [findAssignedGuides] Found unknown guide ID assigned to a group: ${guideId}`);
      }
    }
  }
  
  // If no guides are assigned through the group assignments, check if there's a default guide
  if (assignedGuideIds.size === 0) {
    // Check if we have guide data but no assignments in groups
    if (guide1Info) {
      logger.debug(`🎟️ [findAssignedGuides] No guides assigned to groups, but guide1 exists - adding guide1`);
      assignedGuideIds.add("guide1");
      
      assignedGuides.push({
        id: guide1Info.id || "unknown",
        position: "guide1",
        name: guide1Info.name || "Unknown"
      });
    }
  }
  
  // Log the results
  logger.debug(`🎟️ [findAssignedGuides] Found ${assignedGuideIds.size} assigned guides:`, {
    assignedGuidePositions: Array.from(assignedGuideIds),
    guideDetails: assignedGuides
  });
  
  return assignedGuideIds;
};
