
/**
 * Check if a string is a valid UUID
 */
export const isValidUuid = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Check if a guide ID is a special format (like guide1, guide2, etc.)
 */
export const isSpecialGuideId = (guideId: string | null | undefined): boolean => {
  if (!guideId) return false;
  return guideId.startsWith('guide') || guideId === '_none';
};

/**
 * Maps special guide IDs to their UUID equivalents
 */
export const mapSpecialGuideIdToUuid = (
  guideId: string | null | undefined,
  tourData: any
): string | null => {
  if (!guideId) return null;
  
  // Handle unassign case
  if (guideId === '_none') return null;
  
  // Map special IDs to tour guide fields
  if (guideId === 'guide1' && tourData?.guide1Id) {
    return tourData.guide1Id;
  }
  
  if (guideId === 'guide2' && tourData?.guide2Id) {
    return tourData.guide2Id;
  }
  
  if (guideId === 'guide3' && tourData?.guide3Id) {
    return tourData.guide3Id;
  }
  
  // If it's already a UUID, return it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // If we can't map it, return null
  return null;
};
