
/**
 * Utilities for guide ID validation and processing
 */

/**
 * Check if a string is a valid UUID
 */
export const isValidUuid = (str: string | undefined): boolean => {
  if (!str) return false;
  
  // UUID v4 regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

/**
 * Check if a guide ID is a special ID (guide1, guide2, guide3)
 */
export const isSpecialGuideId = (guideId: string | undefined): boolean => {
  if (!guideId) return false;
  return guideId === "guide1" || guideId === "guide2" || guideId === "guide3";
};

/**
 * Sanitizes a guide ID for database storage
 * Returns null for invalid IDs, preserves special IDs and valid UUIDs
 */
export const sanitizeGuideId = (guideId: string | undefined | null): string | null => {
  if (!guideId) return null;
  
  // Allow special guide IDs and valid UUIDs
  if (isSpecialGuideId(guideId) || isValidUuid(guideId)) {
    return guideId;
  }
  
  console.log(`Converting non-standard guide ID to null: ${guideId}`);
  return null;
};
