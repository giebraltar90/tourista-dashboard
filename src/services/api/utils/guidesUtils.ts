/**
 * Validate if a string is a valid UUID
 */
export const isValidUuid = (id: string | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Sanitize guide ID for database storage
 * - For special IDs like guide1, guide2, guide3, return null (these are handled specially in the UI)
 * - For valid UUIDs, return as is
 * - For other values, return null
 */
export const sanitizeGuideId = (guideId?: string): string | null => {
  if (!guideId) return null;
  
  // Special guide IDs should be stored as null in the database
  if (["guide1", "guide2", "guide3", "_none"].includes(guideId)) {
    return null;
  }
  
  // Valid UUIDs should be stored as is
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // Other values should be stored as null
  return null;
};
