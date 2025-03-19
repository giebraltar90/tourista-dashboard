
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
 * Returns null for invalid IDs, preserves valid UUIDs, converts special IDs to null
 * 
 * IMPORTANT: Supabase expects UUID format for the guide_id column
 * However, our application uses special IDs like guide1, guide2, guide3 internally
 * This function converts special IDs to null when sent to the database
 * to prevent "invalid input syntax for type uuid" errors
 */
export const sanitizeGuideId = (guideId: string | undefined | null): string | null => {
  if (!guideId || guideId === "_none") return null;
  
  // If it's a special guide ID, convert to null for database storage
  // This is essential because the database column requires UUID format
  if (isSpecialGuideId(guideId)) {
    console.log(`Converting special guide ID ${guideId} to null for database compatibility`);
    return null;
  }
  
  // Allow valid UUIDs
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  console.log(`Converting non-standard guide ID to null: ${guideId}`);
  return null;
};
