
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
  
  // Log full debug information about guide instances
  logger.debug(`🔎 [FindAssignedGuides] Beginning group assignment check with guides:`, {
    guide1: guide1Info ? {
      id: guide1Info.id,
      name: guide1Info.name,
      type: guide1Info.guideType
    } : 'none',
    guide2: guide2Info ? {
      id: guide2Info.id,
      name: guide2Info.name,
      type: guide2Info.guideType
    } : 'none',
    guide3: guide3Info ? {
      id: guide3Info.id,
      name: guide3Info.name,
      type: guide3Info.guideType
    } : 'none',
    groupCount: tourGroups.length,
  });
  
  // Create lookup tables for matching
  const guideNameToKey = new Map<string, string>();
  const guideIdToKey = new Map<string, string>();
  
  // Add guide1 to lookup tables
  if (guide1Info) {
    if (guide1Info.name) guideNameToKey.set(guide1Info.name.toLowerCase(), "guide1");
    if (guide1Info.id) guideIdToKey.set(guide1Info.id.toLowerCase(), "guide1");
    guideIdToKey.set("guide1", "guide1");
  }
  
  // Add guide2 to lookup tables
  if (guide2Info) {
    if (guide2Info.name) guideNameToKey.set(guide2Info.name.toLowerCase(), "guide2");
    if (guide2Info.id) guideIdToKey.set(guide2Info.id.toLowerCase(), "guide2");
    guideIdToKey.set("guide2", "guide2");
  }
  
  // Add guide3 to lookup tables
  if (guide3Info) {
    if (guide3Info.name) guideNameToKey.set(guide3Info.name.toLowerCase(), "guide3");
    if (guide3Info.id) guideIdToKey.set(guide3Info.id.toLowerCase(), "guide3");
    guideIdToKey.set("guide3", "guide3");
  }
  
  // Log the lookup tables
  logger.debug(`🔎 [FindAssignedGuides] Guide lookup tables:`, {
    nameToKey: Object.fromEntries(guideNameToKey),
    idToKey: Object.fromEntries(guideIdToKey),
  });

  // Detailed logging for each group
  tourGroups.forEach((group, index) => {
    if (!group) {
      logger.debug(`🔎 [FindAssignedGuides] Group ${index} is undefined or null`);
      return;
    }
    
    const groupGuideId = group.guideId || group.guide_id;
    const groupGuideName = group.guideName;
    
    logger.debug(`🔎 [FindAssignedGuides] Checking group ${index}:`, {
      groupId: group.id || 'unknown',
      groupName: group.name || `Group ${index + 1}`,
      guideId: groupGuideId || 'none',
      guideName: groupGuideName || 'none',
      hasGuide: Boolean(groupGuideId && groupGuideId !== "unassigned")
    });
    
    // Skip groups without guides
    if (!groupGuideId || groupGuideId === "unassigned") {
      logger.debug(`🔎 [FindAssignedGuides] Group ${index} has no guide assigned`);
      return;
    }
    
    // First try ID-based matching (most reliable)
    const guideIdNormalized = typeof groupGuideId === 'string' ? groupGuideId.toLowerCase() : '';
    if (guideIdToKey.has(guideIdNormalized)) {
      const guideKey = guideIdToKey.get(guideIdNormalized);
      assignedGuideIds.add(guideKey!);
      logger.debug(`✅ [FindAssignedGuides] Found guide by ID match: ${guideKey} in group ${group.name || index}`);
      return;
    }
    
    // Then try name-based matching if group has guideName
    if (groupGuideName && typeof groupGuideName === 'string') {
      const guideNameNormalized = groupGuideName.toLowerCase();
      if (guideNameToKey.has(guideNameNormalized)) {
        const guideKey = guideNameToKey.get(guideNameNormalized);
        assignedGuideIds.add(guideKey!);
        logger.debug(`✅ [FindAssignedGuides] Found guide by name match: ${guideKey} in group ${group.name || index}`);
        return;
      }
      
      // Try partial name matching if exact match fails
      for (const [guideName, guideKey] of guideNameToKey.entries()) {
        if (guideNameNormalized.includes(guideName) || guideName.includes(guideNameNormalized)) {
          assignedGuideIds.add(guideKey);
          logger.debug(`✅ [FindAssignedGuides] Found guide by partial name match: ${guideKey} in group ${group.name || index}`);
          return;
        }
      }
    }

    // If we got here, try one last heuristic - check if the guide ID matches any guide names
    if (typeof groupGuideId === 'string' && guide1Info && guide1Info.name && 
        groupGuideId.toLowerCase() === guide1Info.name.toLowerCase()) {
      assignedGuideIds.add("guide1");
      logger.debug(`✅ [FindAssignedGuides] Found guide1 by ID-name match in group ${group.name || index}`);
      return;
    }
    
    if (typeof groupGuideId === 'string' && guide2Info && guide2Info.name && 
        groupGuideId.toLowerCase() === guide2Info.name.toLowerCase()) {
      assignedGuideIds.add("guide2");
      logger.debug(`✅ [FindAssignedGuides] Found guide2 by ID-name match in group ${group.name || index}`);
      return;
    }
    
    if (typeof groupGuideId === 'string' && guide3Info && guide3Info.name && 
        groupGuideId.toLowerCase() === guide3Info.name.toLowerCase()) {
      assignedGuideIds.add("guide3");
      logger.debug(`✅ [FindAssignedGuides] Found guide3 by ID-name match in group ${group.name || index}`);
      return;
    }
    
    // Last extreme fallback - special handling for known guides by partial name matching in the ID
    if (typeof groupGuideId === 'string') {
      const guideIdLower = groupGuideId.toLowerCase();
      
      // Special case for common guide names
      const specialCaseMatching = [
        { namePattern: "maria", guideKey: guide1Info?.name?.toLowerCase()?.includes("maria") ? "guide1" : 
                                 guide2Info?.name?.toLowerCase()?.includes("maria") ? "guide2" : 
                                 guide3Info?.name?.toLowerCase()?.includes("maria") ? "guide3" : null },
        { namePattern: "jean", guideKey: guide1Info?.name?.toLowerCase()?.includes("jean") ? "guide1" : 
                               guide2Info?.name?.toLowerCase()?.includes("jean") ? "guide2" : 
                               guide3Info?.name?.toLowerCase()?.includes("jean") ? "guide3" : null },
        { namePattern: "sophie", guideKey: guide1Info?.name?.toLowerCase()?.includes("sophie") ? "guide1" : 
                                guide2Info?.name?.toLowerCase()?.includes("sophie") ? "guide2" : 
                                guide3Info?.name?.toLowerCase()?.includes("sophie") ? "guide3" : null },
        { namePattern: "carlos", guideKey: guide1Info?.name?.toLowerCase()?.includes("carlos") ? "guide1" : 
                                guide2Info?.name?.toLowerCase()?.includes("carlos") ? "guide2" : 
                                guide3Info?.name?.toLowerCase()?.includes("carlos") ? "guide3" : null },
        { namePattern: "tobias", guideKey: guide1Info?.name?.toLowerCase()?.includes("tobias") ? "guide1" : 
                                guide2Info?.name?.toLowerCase()?.includes("tobias") ? "guide2" : 
                                guide3Info?.name?.toLowerCase()?.includes("tobias") ? "guide3" : null },
      ];
      
      for (const { namePattern, guideKey } of specialCaseMatching) {
        if (guideKey && guideIdLower.includes(namePattern)) {
          assignedGuideIds.add(guideKey);
          logger.debug(`✅ [FindAssignedGuides] Found ${guideKey} by special case name pattern '${namePattern}' in group ${group.name || index}`);
          return;
        }
      }
    }
    
    logger.debug(`❓ [FindAssignedGuides] Could not match guide for group ${group.name || index} with guideId ${groupGuideId}`);
  });
  
  logger.debug(`🔎 [FindAssignedGuides] Final assigned guide IDs: ${Array.from(assignedGuideIds).join(', ') || 'None'}`);
  
  return assignedGuideIds;
};
