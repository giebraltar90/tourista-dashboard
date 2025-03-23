
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { logger } from "@/utils/logger";

/**
 * Process guide info from data 
 */
export const processGuideInfo = (
  rawGuideInfo: any, 
  guideName: string | undefined,
  guideKey: string
): GuideInfo | null => {
  // If there's no raw info or name, return null
  if (!rawGuideInfo && !guideName) {
    return null;
  }
  
  // Create a standardized guide info object
  const processedGuide: GuideInfo = {
    id: rawGuideInfo?.id || guideKey,
    name: rawGuideInfo?.name || guideName || guideKey,
    guideType: rawGuideInfo?.guideType || 'GA Ticket', // Default to GA Ticket if no type specified
    birthday: rawGuideInfo?.birthday || undefined
  };
  
  logger.debug(`🔄 [processGuideInfo] Processed ${guideKey}:`, {
    id: processedGuide.id,
    name: processedGuide.name,
    type: processedGuide.guideType,
    hasRawInfo: !!rawGuideInfo
  });
  
  return processedGuide;
};

/**
 * Map guide IDs in tour groups for consistency
 */
export const mapTourGroupGuideIds = (
  tourGroups: VentrataTourGroup[],
  guide1: string | undefined,
  guide2: string | undefined,
  guide3: string | undefined
): VentrataTourGroup[] => {
  if (!Array.isArray(tourGroups) || tourGroups.length === 0) {
    return [];
  }
  
  logger.debug(`🔄 [mapTourGroupGuideIds] Mapping guide IDs in ${tourGroups.length} groups`);
  
  return tourGroups.map(group => {
    let mappedGuideId = group.guideId;
    let guideName = group.guideName;
    
    // If the guideId matches a guide name, map it to the guide key
    if (guide1 && (group.guideId === guide1 || group.guideName === guide1)) {
      mappedGuideId = 'guide1';
      guideName = guide1;
      logger.debug(`🔄 [mapTourGroupGuideIds] Mapped ${group.guideId} to guide1 in group ${group.name || 'unnamed'}`);
    } else if (guide2 && (group.guideId === guide2 || group.guideName === guide2)) {
      mappedGuideId = 'guide2';
      guideName = guide2;
      logger.debug(`🔄 [mapTourGroupGuideIds] Mapped ${group.guideId} to guide2 in group ${group.name || 'unnamed'}`);
    } else if (guide3 && (group.guideId === guide3 || group.guideName === guide3)) {
      mappedGuideId = 'guide3';
      guideName = guide3;
      logger.debug(`🔄 [mapTourGroupGuideIds] Mapped ${group.guideId} to guide3 in group ${group.name || 'unnamed'}`);
    }
    
    return {
      ...group,
      guideId: mappedGuideId,
      guideName: guideName || group.guideName
    };
  });
};
