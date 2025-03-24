
/**
 * Validates if a string is a valid UUID
 */
export const isValidUuid = (id: string): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Checks if a guide ID is a special ID like 'guide1', 'guide2', etc.
 */
export const isSpecialGuideId = (guideId: string | null | undefined): boolean => {
  if (!guideId) return false;
  return /^guide[1-3]$/i.test(guideId);
};

/**
 * Maps a special guide ID like 'guide1' to the actual UUID from the tour object
 */
export const mapSpecialGuideIdToUuid = (
  guideId: string | null | undefined, 
  tourGuide1Id: string | null | undefined,
  tourGuide2Id: string | null | undefined,
  tourGuide3Id: string | null | undefined
): string | null | undefined => {
  if (!guideId) return null;
  
  if (guideId.toLowerCase() === 'guide1') return tourGuide1Id;
  if (guideId.toLowerCase() === 'guide2') return tourGuide2Id;
  if (guideId.toLowerCase() === 'guide3') return tourGuide3Id;
  
  return guideId;
};
