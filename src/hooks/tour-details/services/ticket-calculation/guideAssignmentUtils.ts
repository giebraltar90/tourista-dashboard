
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
  
  logger.debug(`🔎 [FindAssignedGuides] Checking assigned guides across ${tourGroups.length} groups with:`, {
    guide1: guide1Info ? `${guide1Info.name} (${guide1Info.id})` : 'none',
    guide2: guide2Info ? `${guide2Info.name} (${guide2Info.id})` : 'none',
    guide3: guide3Info ? `${guide3Info.name} (${guide3Info.id})` : 'none',
  });
  
  // Debug log all guide IDs to match against
  const allGuideIds = [];
  if (guide1Info) {
    allGuideIds.push({ key: 'guide1', id: guide1Info.id, name: guide1Info.name });
  }
  if (guide2Info) {
    allGuideIds.push({ key: 'guide2', id: guide2Info.id, name: guide2Info.name });
  }
  if (guide3Info) {
    allGuideIds.push({ key: 'guide3', id: guide3Info.id, name: guide3Info.name });
  }
  
  logger.debug(`🔎 [FindAssignedGuides] Available guide IDs for matching:`, allGuideIds);
  
  // Log all groups' guide information
  tourGroups.forEach((group, index) => {
    logger.debug(`🔎 [FindAssignedGuides] Checking group ${index}:`, {
      groupId: group.id,
      groupName: group.name,
      guideId: group.guideId,
      guideName: group.guideName,
      hasGuide: !!group.guideId && group.guideId !== "unassigned"
    });
  });
  
  // Enhanced matching logic
  tourGroups.forEach(group => {
    if (group.guideId && group.guideId !== "unassigned") {
      // Check if this guide matches one of our main guides
      if (guide1Info && (
          group.guideId === guide1Info.id || 
          group.guideId === 'guide1' || 
          (typeof guide1Info.name === 'string' && 
            (group.guideId === guide1Info.name || 
             (group.guideName && group.guideName === guide1Info.name)))
        )) {
        assignedGuideIds.add("guide1");
        logger.debug(`✅ [FindAssignedGuides] Found guide1 (${guide1Info.name}) assigned to group ${group.name || 'Unnamed'} with ID ${group.guideId}`);
      }
      else if (guide2Info && (
          group.guideId === guide2Info.id ||
          group.guideId === 'guide2' ||
          (typeof guide2Info.name === 'string' && 
            (group.guideId === guide2Info.name || 
             (group.guideName && group.guideName === guide2Info.name)))
        )) {
        assignedGuideIds.add("guide2");
        logger.debug(`✅ [FindAssignedGuides] Found guide2 (${guide2Info.name}) assigned to group ${group.name || 'Unnamed'} with ID ${group.guideId}`);
      }
      else if (guide3Info && (
          group.guideId === guide3Info.id ||
          group.guideId === 'guide3' ||
          (typeof guide3Info.name === 'string' && 
            (group.guideId === guide3Info.name || 
             (group.guideName && group.guideName === guide3Info.name)))
        )) {
        assignedGuideIds.add("guide3");
        logger.debug(`✅ [FindAssignedGuides] Found guide3 (${guide3Info.name}) assigned to group ${group.name || 'Unnamed'} with ID ${group.guideId}`);
      } else {
        logger.debug(`❓ [FindAssignedGuides] Found unrecognized guide ${group.guideId} in group ${group.name || 'Unnamed'}`);
        
        // Additional check: try to match by name comparison if guideName is present
        if (group.guideName) {
          if (guide1Info && typeof guide1Info.name === 'string' && 
              (group.guideName.toLowerCase().includes(guide1Info.name.toLowerCase()) ||
               (guide1Info.name.toLowerCase().includes(group.guideName.toLowerCase())))) {
            assignedGuideIds.add("guide1");
            logger.debug(`✅ [FindAssignedGuides] Matched guide1 by name similarity: '${group.guideName}' contains/is contained in '${guide1Info.name}'`);
          }
          else if (guide2Info && typeof guide2Info.name === 'string' && 
                  (group.guideName.toLowerCase().includes(guide2Info.name.toLowerCase()) ||
                   (guide2Info.name.toLowerCase().includes(group.guideName.toLowerCase())))) {
            assignedGuideIds.add("guide2");
            logger.debug(`✅ [FindAssignedGuides] Matched guide2 by name similarity: '${group.guideName}' contains/is contained in '${guide2Info.name}'`);
          }
          else if (guide3Info && typeof guide3Info.name === 'string' && 
                  (group.guideName.toLowerCase().includes(guide3Info.name.toLowerCase()) ||
                   (guide3Info.name.toLowerCase().includes(group.guideName.toLowerCase())))) {
            assignedGuideIds.add("guide3");
            logger.debug(`✅ [FindAssignedGuides] Matched guide3 by name similarity: '${group.guideName}' contains/is contained in '${guide3Info.name}'`);
          }
        }
        
        // Another attempt: try to match by direct name comparison against guide objects
        // This helps when guideId is set to something like a UUID but doesn't match our known guide IDs
        if (guide1Info && guide1Info.name && group.guideName && 
            guide1Info.name.toLowerCase() === group.guideName.toLowerCase()) {
          assignedGuideIds.add("guide1");
          logger.debug(`✅ [FindAssignedGuides] Matched guide1 by exact name: '${group.guideName}' equals '${guide1Info.name}'`);
        }
        else if (guide2Info && guide2Info.name && group.guideName && 
                 guide2Info.name.toLowerCase() === group.guideName.toLowerCase()) {
          assignedGuideIds.add("guide2");
          logger.debug(`✅ [FindAssignedGuides] Matched guide2 by exact name: '${group.guideName}' equals '${guide2Info.name}'`);
        }
        else if (guide3Info && guide3Info.name && group.guideName && 
                 guide3Info.name.toLowerCase() === group.guideName.toLowerCase()) {
          assignedGuideIds.add("guide3");
          logger.debug(`✅ [FindAssignedGuides] Matched guide3 by exact name: '${group.guideName}' equals '${guide3Info.name}'`);
        }
      }
    }
  });
  
  logger.debug(`🔎 [FindAssignedGuides] Final assigned guide IDs:`, Array.from(assignedGuideIds));
  
  return assignedGuideIds;
};
