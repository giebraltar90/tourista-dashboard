
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
 * Map special guide IDs to their actual values or return UUID as is
 * This function doesn't throw errors, it just returns the input if mapping fails
 */
export const mapSpecialGuideIdToUuid = (guideId: string | undefined, tour: any): string | null => {
  if (!guideId || guideId === "_none") return null;
  
  console.log("Mapping guide ID to UUID:", { 
    guideId, 
    tour: tour ? {
      guide1: tour.guide1,
      guide2: tour.guide2,
      guide3: tour.guide3,
      guide1Id: tour.guide1Id,
      guide2Id: tour.guide2Id,
      guide3Id: tour.guide3Id
    } : 'Tour data not available'
  });
  
  // If there's no tour data, just return the guide ID as is
  if (!tour) return guideId;
  
  // Map special guide IDs to their UUID values from the tour record
  if (guideId === "guide1" && tour.guide1Id) {
    console.log(`Mapped guide1 to UUID: ${tour.guide1Id}`);
    return tour.guide1Id;
  }
  
  if (guideId === "guide2" && tour.guide2Id) {
    console.log(`Mapped guide2 to UUID: ${tour.guide2Id}`);
    return tour.guide2Id;
  }
  
  if (guideId === "guide3" && tour.guide3Id) {
    console.log(`Mapped guide3 to UUID: ${tour.guide3Id}`);
    return tour.guide3Id;
  }
  
  // If it's already a UUID, return it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // If we get here, we're dealing with a special ID without mapping
  // Just return it as is, and let the caller handle it appropriately
  return guideId;
};

/**
 * For UI display, get the readable guide name from any guide ID
 */
export const getGuideDisplayName = (guideId: string | undefined, tour: any, guides: any[] = []): string => {
  if (!guideId || guideId === "_none") return "Unassigned";
  
  // Check special IDs first
  if (guideId === "guide1" && tour?.guide1) return tour.guide1;
  if (guideId === "guide2" && tour?.guide2) return tour.guide2;
  if (guideId === "guide3" && tour?.guide3) return tour.guide3;
  
  // Then check UUID matches in guides array
  if (isValidUuid(guideId)) {
    const matchingGuide = guides.find(g => g.id === guideId);
    if (matchingGuide?.name) return matchingGuide.name;
  }
  
  // Fallback for unknown IDs (should rarely happen)
  return guideId.startsWith("guide") ? `Guide ${guideId.slice(5)}` : `Guide (${guideId.substring(0, 6)}...)`;
};
