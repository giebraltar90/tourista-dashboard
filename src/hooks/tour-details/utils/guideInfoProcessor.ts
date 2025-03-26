
import { GuideInfo } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { logger } from "@/utils/logger";

/**
 * Process a guide (can be in many different formats) into standardized guide info
 */
export const processGuideInfo = (
  guide: any, 
  guidePosition: string
): GuideInfo | null => {
  // If guide is null or undefined, return null
  if (!guide) {
    logger.debug(`No guide data for ${guidePosition}`);
    return null;
  }
  
  // If guide is already a GuideInfo object
  if (guide.guideType) {
    return guide;
  }
  
  // Try to extract name for debugging
  const guideName = typeof guide === 'string' 
    ? guide 
    : guide.name || guide.guide_name || guide.guideName || guidePosition;
  
  logger.debug(`Processing guide ${guideName} for position ${guidePosition}`);
  
  // Special case for "Sophie Miller" who's always a GC guide
  const isSophieMiller = typeof guide === 'string' && 
    (guide.toLowerCase().includes('sophie') || guide.toLowerCase().includes('miller'));
  
  // Create a fallback guide with default values
  const fallbackGuide: GuideInfo = {
    id: guidePosition,
    name: guideName,
    guideType: isSophieMiller ? 'GC' : 'GA Ticket'
  };
  
  // Handle string guide (just a name)
  if (typeof guide === 'string') {
    return fallbackGuide;
  }
  
  // Handle guide object with different property formats
  return {
    id: guide.id || guidePosition,
    name: guide.name || guide.guide_name || guide.guideName || guideName,
    guideType: guide.guideType || guide.guide_type || fallbackGuide.guideType
  };
};

/**
 * Get text representation of guide for display
 */
export const getGuideDisplayText = (
  guide: GuideInfo | null | undefined,
  includeType: boolean = false
): string => {
  if (!guide) return 'No guide';
  
  const displayName = guide.name || 'Unnamed Guide';
  
  if (includeType) {
    return `${displayName} (${guide.guideType})`;
  }
  
  return displayName;
};
