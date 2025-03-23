
import { GuideInfo, GuideType } from '@/types/ventrata';
import { logger } from '@/utils/logger';

/**
 * Processes a guide's information with special business rules
 */
export const processGuideInfo = (
  rawGuideInfo: GuideInfo | null,
  guideName: string | undefined,
  guideId: string = 'unknown'
): GuideInfo | null => {
  // If no guide name is provided, return null
  if (!guideName) {
    return null;
  }
  
  // If we have raw guide info from the database
  if (rawGuideInfo) {
    // Create a copy to avoid mutating the original
    const updatedInfo = { ...rawGuideInfo };
    
    // Special case: Sophie Miller is always a GC guide
    if (updatedInfo.name && updatedInfo.name.toLowerCase().includes('sophie miller')) {
      updatedInfo.guideType = 'GC' as GuideType;
      logger.debug(`🔄 [guideInfoProcessor] Set Sophie Miller as GC guide`);
    }
    
    // Ensure ID exists
    if (!updatedInfo.id) {
      updatedInfo.id = guideId;
    }
    
    return updatedInfo;
  } 
  
  // Create fallback guide info if no database info is available
  const isSophieMiller = guideName.toLowerCase().includes('sophie miller');
  
  // Set appropriate guide type based on name
  let guideType: GuideType;
  if (isSophieMiller) {
    guideType = 'GC' as GuideType;
  } else if (guideId === 'guide2') {
    // Secondary guides typically get free entry
    guideType = 'GA Free' as GuideType;
  } else {
    // Default for primary and other guides
    guideType = 'GA Ticket' as GuideType;
  }
  
  const fallbackInfo: GuideInfo = {
    id: guideId,
    name: guideName,
    birthday: new Date(),
    guideType
  };
  
  logger.debug(`🔄 [guideInfoProcessor] Created fallback guide info for ${guideName}: ${guideType}`);
  
  return fallbackInfo;
};

/**
 * Maps guide UUIDs to simpler guide1, guide2, guide3 identifiers for easier reference
 */
export const mapTourGroupGuideIds = (
  tourGroups: any[] = [],
  guide1: string | undefined = '',
  guide2: string | undefined = '',
  guide3: string | undefined = ''
): any[] => {
  if (!Array.isArray(tourGroups) || tourGroups.length === 0) {
    return tourGroups;
  }
  
  return tourGroups.map(group => {
    let mappedGuideId = group.guideId;
    
    // Only map if there's a guide ID
    if (group.guideId) {
      // Try to match with guide1, guide2, guide3
      if (guide1 && group.guideId === guide1) {
        mappedGuideId = 'guide1';
        logger.debug(`🔄 [guideInfoProcessor] Mapped ${group.guideId} to guide1`);
      } else if (guide2 && group.guideId === guide2) {
        mappedGuideId = 'guide2';
        logger.debug(`🔄 [guideInfoProcessor] Mapped ${group.guideId} to guide2`);
      } else if (guide3 && group.guideId === guide3) {
        mappedGuideId = 'guide3';
        logger.debug(`🔄 [guideInfoProcessor] Mapped ${group.guideId} to guide3`);
      }
    }
    
    return { ...group, guideId: mappedGuideId };
  });
};
