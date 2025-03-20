
/**
 * Validate if a string is a valid UUID
 */
export const isValidUuid = (id: string | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Check if a guide ID is one of the special IDs (guide1, guide2, guide3, _none)
 */
export const isSpecialGuideId = (guideId?: string): boolean => {
  if (!guideId) return false;
  return ["guide1", "guide2", "guide3", "_none"].includes(guideId);
};

/**
 * Sanitize guide ID for database storage
 * - For special IDs (guide1, guide2, guide3), preserve the original format
 * - For _none, return null
 * - For UUIDs and other formats, return as is
 */
export const sanitizeGuideId = (guideId?: string): string | null => {
  if (!guideId || guideId === "_none") return null;
  
  // Important: Return special guide IDs directly without modification
  // This ensures "guide1", "guide2", "guide3" are stored as-is in the database
  return guideId;
};
