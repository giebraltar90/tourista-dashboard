
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
 * Sanitize guide ID for backward compatibility
 * @deprecated Use mapSpecialGuideIdToUuid instead for database operations
 */
export const sanitizeGuideId = (guideId?: string): string | null => {
  if (!guideId || guideId === "_none") return null;
  
  // For backward compatibility, return the ID as-is
  // This function is deprecated - use mapSpecialGuideIdToUuid for database operations
  return guideId;
};

/**
 * Map special guide IDs to their actual UUID values from the tour record
 * This is the key fix: we translate special IDs to real UUIDs before database storage
 * 
 * @param guideId The special guide ID (guide1, guide2, guide3) or UUID
 * @param tour Tour data containing the actual guide UUID values
 * @returns A valid UUID for database storage or null
 */
export const mapSpecialGuideIdToUuid = (guideId: string | undefined, tour: any): string | null => {
  if (!guideId || guideId === "_none") return null;
  
  console.log("Mapping guide ID to UUID:", { 
    guideId, 
    tour: {
      guide1: tour?.guide1,
      guide2: tour?.guide2,
      guide3: tour?.guide3,
      guide1Id: tour?.guide1Id,
      guide2Id: tour?.guide2Id,
      guide3Id: tour?.guide3Id
    }
  });
  
  // Map special guide IDs to their UUID values from the tour record
  if (guideId === "guide1" && tour?.guide1Id) {
    console.log(`Mapped guide1 to UUID: ${tour.guide1Id}`);
    return tour.guide1Id;
  }
  if (guideId === "guide1" && tour?.guide1) {
    console.log(`Mapped guide1 to value: ${tour.guide1}`);
    return tour.guide1;
  }
  if (guideId === "guide2" && tour?.guide2Id) {
    console.log(`Mapped guide2 to UUID: ${tour.guide2Id}`);
    return tour.guide2Id;
  }
  if (guideId === "guide2" && tour?.guide2) {
    console.log(`Mapped guide2 to value: ${tour.guide2}`);
    return tour.guide2;
  }
  if (guideId === "guide3" && tour?.guide3Id) {
    console.log(`Mapped guide3 to UUID: ${tour.guide3Id}`);
    return tour.guide3Id;
  }
  if (guideId === "guide3" && tour?.guide3) {
    console.log(`Mapped guide3 to value: ${tour.guide3}`);
    return tour.guide3;
  }
  
  // If it's already a UUID, return it directly
  if (isValidUuid(guideId)) {
    console.log(`Guide ID is already a UUID: ${guideId}`);
    return guideId;
  }
  
  // If we get here, we don't have a valid UUID to store
  console.error("Cannot map guide ID to UUID:", guideId, "Tour data:", tour);
  return null;
};
