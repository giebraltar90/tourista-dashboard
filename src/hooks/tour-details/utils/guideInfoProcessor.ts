
import { logger } from "@/utils/logger";
import { GuideInfo } from "@/types/ventrata";

/**
 * Process guide information from raw data or fallback to default values
 */
export const processGuideInfo = (
  rawGuideInfo: GuideInfo | null,
  guideName: string | undefined, 
  guidePosition: string
): GuideInfo | null => {
  // If no guide name, return null
  if (!guideName) {
    logger.debug(`🔄 [processGuideInfo] No guide name for ${guidePosition}, returning null`);
    return null;
  }
  
  // If we have guide data from the API, use it
  if (rawGuideInfo) {
    // Create a copy to avoid mutating the original
    const processedGuide = { ...rawGuideInfo };
    
    // Special case: Sophie Miller is always a GC guide
    if (processedGuide.name && processedGuide.name.toLowerCase().includes('sophie miller')) {
      processedGuide.guideType = 'GC';
      logger.debug(`🔄 [processGuideInfo] Special case: ${processedGuide.name} set as GC`);
    }
    
    logger.debug(`🔄 [processGuideInfo] Processed ${guidePosition}: ${processedGuide.name}, type: ${processedGuide.guideType}`);
    return processedGuide;
  } 
  
  // Create fallback guide info
  const isSophieMiller = guideName.toLowerCase().includes('sophie miller');
  const fallbackGuide: GuideInfo = {
    id: guidePosition,
    name: guideName,
    birthday: new Date(),
    guideType: isSophieMiller ? 'GC' : 'GA Ticket'
  };
  
  logger.debug(`🔄 [processGuideInfo] Created fallback for ${guidePosition}: ${fallbackGuide.name}, type: ${fallbackGuide.guideType}`);
  return fallbackGuide;
};

/**
 * Map guide IDs in tour groups to ensure consistent guide assignments
 */
export const mapTourGroupGuideIds = (
  tourGroups: any[] = [],
  guide1: string | undefined,
  guide2: string | undefined,
  guide3: string | undefined
): any[] => {
  if (!Array.isArray(tourGroups) || tourGroups.length === 0) {
    return [];
  }
  
  // Create a map of guides by name for quick lookup
  const guideMap = new Map<string, string>();
  if (guide1) guideMap.set(guide1.toLowerCase(), "guide1");
  if (guide2) guideMap.set(guide2.toLowerCase(), "guide2");
  if (guide3) guideMap.set(guide3.toLowerCase(), "guide3");
  
  logger.debug(`🔄 [mapTourGroupGuideIds] Mapping ${tourGroups.length} groups with guides:`, {
    guide1: guide1 || 'none',
    guide2: guide2 || 'none',
    guide3: guide3 || 'none'
  });
  
  // Map each group to ensure consistent guide IDs
  const mappedGroups = tourGroups.map((group, index) => {
    const groupCopy = { ...group };
    
    // If the group has a guideName but no guideId, try to map it
    if (groupCopy.guideName && (!groupCopy.guideId || groupCopy.guideId === 'unassigned')) {
      const normalizedName = groupCopy.guideName.toLowerCase();
      const guideId = guideMap.get(normalizedName);
      
      if (guideId) {
        groupCopy.guideId = guideId;
        logger.debug(`🔄 [mapTourGroupGuideIds] Group ${index} mapped guide name "${groupCopy.guideName}" to ID "${guideId}"`);
      }
    }
    
    // If the group has a guideId but no guideName, set the guideName
    if (groupCopy.guideId && !groupCopy.guideName) {
      if (groupCopy.guideId === "guide1" && guide1) {
        groupCopy.guideName = guide1;
      } else if (groupCopy.guideId === "guide2" && guide2) {
        groupCopy.guideName = guide2;
      } else if (groupCopy.guideId === "guide3" && guide3) {
        groupCopy.guideName = guide3;
      }
      
      logger.debug(`🔄 [mapTourGroupGuideIds] Group ${index} set guide name "${groupCopy.guideName}" from ID "${groupCopy.guideId}"`);
    }
    
    return groupCopy;
  });
  
  logger.debug(`🔄 [mapTourGroupGuideIds] Finished mapping ${mappedGroups.length} groups`);
  return mappedGroups;
};
