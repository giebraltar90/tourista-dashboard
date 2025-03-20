
/**
 * Validate if a string is a valid UUID
 */
export const isValidUuid = (id: string | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Check if a guide ID is one of the special IDs (guide1, guide2, guide3, _none)
 * These are no longer supported in the database but kept for backward compatibility
 */
export const isSpecialGuideId = (guideId?: string): boolean => {
  if (!guideId) return false;
  return ["guide1", "guide2", "guide3", "_none"].includes(guideId);
};

/**
 * Map special guide IDs to their actual UUID values or return UUID as is
 * This function doesn't throw errors, it just returns the input if mapping fails
 * 
 * NOTE: This function is kept for backward compatibility but should not be used
 * for new code. All guide IDs should be proper UUIDs.
 */
export const mapSpecialGuideIdToUuid = (guideId: string | undefined, tour: any): string | null => {
  if (!guideId || guideId === "_none") return null;
  
  console.log("DEPRECATED - mapSpecialGuideIdToUuid should not be used. All guide IDs should be UUIDs. Received:", { 
    guideId, 
    isUuid: isValidUuid(guideId),
    tourInfo: tour ? {
      guideIds: [tour.guide1Id, tour.guide2Id, tour.guide3Id].filter(Boolean)
    } : 'Tour data not available'
  });
  
  // If it's already a UUID, return it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // If there's no tour data or not a special ID, just return the guide ID as is
  if (!tour || !isSpecialGuideId(guideId)) return guideId;
  
  // This code is deprecated and should not be used for new features
  // We are only keeping it for backward compatibility
  console.error("Special guide IDs like 'guide1' are no longer supported. Use UUID values instead.");
  return guideId;
};

/**
 * For UI display, get the readable guide name from any guide ID
 */
export const getGuideDisplayName = (guideId: string | undefined, tour: any, guides: any[] = []): string => {
  if (!guideId || guideId === "_none") return "Unassigned";
  
  // Check UUID matches in guides array
  if (isValidUuid(guideId)) {
    const matchingGuide = guides.find(g => g.id === guideId);
    if (matchingGuide?.name) return matchingGuide.name;
  }
  
  // Special IDs are deprecated but kept for backward compatibility
  // This should be removed in a future version
  if (guideId === "guide1" && tour?.guide1) return tour.guide1;
  if (guideId === "guide2" && tour?.guide2) return tour.guide2;
  if (guideId === "guide3" && tour?.guide3) return tour.guide3;
  
  // If the guide ID matches one of the primary guide IDs directly, use the name
  if (tour?.guide1Id === guideId && tour?.guide1) return tour.guide1;
  if (tour?.guide2Id === guideId && tour?.guide2) return tour.guide2;
  if (tour?.guide3Id === guideId && tour?.guide3) return tour.guide3;
  
  // Fallback for unknown IDs (should rarely happen)
  return guideId.startsWith("guide") ? `Guide ${guideId.slice(5)}` : `Guide (${guideId.substring(0, 6)}...)`;
};
