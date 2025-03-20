
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
 */
export const mapSpecialGuideIdToUuid = (guideId: string | undefined, tour: any): string | null => {
  if (!guideId || guideId === "_none") return null;
  
  console.log("mapSpecialGuideIdToUuid called with:", { 
    guideId, 
    tourInfo: tour ? {
      guide1Id: tour.guide1Id,
      guide2Id: tour.guide2Id,
      guide3Id: tour.guide3Id
    } : 'Tour data not available'
  });
  
  // If it's already a UUID, return it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // If there's no tour data, just return null for special IDs
  if (!tour) return null;
  
  // Map special guide IDs to their UUID values
  if (guideId === "guide1" && tour.guide1Id && isValidUuid(tour.guide1Id)) {
    console.log(`Mapped guide1 to UUID: ${tour.guide1Id}`);
    return tour.guide1Id;
  }
  
  if (guideId === "guide2" && tour.guide2Id && isValidUuid(tour.guide2Id)) {
    console.log(`Mapped guide2 to UUID: ${tour.guide2Id}`);
    return tour.guide2Id;
  }
  
  if (guideId === "guide3" && tour.guide3Id && isValidUuid(tour.guide3Id)) {
    console.log(`Mapped guide3 to UUID: ${tour.guide3Id}`);
    return tour.guide3Id;
  }
  
  // If we couldn't map the ID directly using the tour data, 
  // try to find the guide in the guides list by name
  if (guideId === "guide1" && tour.guide1 && tour.guides) {
    const guide = tour.guides.find(g => g.name === tour.guide1);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Mapped guide1 (${tour.guide1}) to UUID: ${guide.id} from guides list`);
      return guide.id;
    }
  }
  
  if (guideId === "guide2" && tour.guide2 && tour.guides) {
    const guide = tour.guides.find(g => g.name === tour.guide2);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Mapped guide2 (${tour.guide2}) to UUID: ${guide.id} from guides list`);
      return guide.id;
    }
  }
  
  if (guideId === "guide3" && tour.guide3 && tour.guides) {
    const guide = tour.guides.find(g => g.name === tour.guide3);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Mapped guide3 (${tour.guide3}) to UUID: ${guide.id} from guides list`);
      return guide.id;
    }
  }
  
  // If we still couldn't map the ID, return null
  console.error(`Could not map special guide ID "${guideId}" to UUID - no matching ID found in tour data`);
  return null;
};

/**
 * For UI display, get the readable guide name from any guide ID
 */
export const getGuideDisplayName = (guideId: string | undefined, tour: any, guides: any[] = []): string => {
  if (!guideId || guideId === "_none") return "Unassigned";
  
  // Log complete debug information
  console.log("getGuideDisplayName called with:", {
    guideId,
    isUuid: isValidUuid(guideId),
    tourHasGuides: tour?.guide1 || tour?.guide2 || tour?.guide3 ? "Yes" : "No",
    availableGuides: guides.map(g => ({ id: g.id, name: g.name }))
  });
  
  // Check UUID matches in guides array - this is the most reliable method
  if (isValidUuid(guideId)) {
    const matchingGuide = guides.find(g => g.id === guideId);
    if (matchingGuide?.name) {
      console.log(`Found matching guide by UUID: ${matchingGuide.name}`);
      return matchingGuide.name;
    }
  }
  
  // Special IDs are deprecated but kept for backward compatibility
  if (guideId === "guide1" && tour?.guide1) return tour.guide1;
  if (guideId === "guide2" && tour?.guide2) return tour.guide2;
  if (guideId === "guide3" && tour?.guide3) return tour.guide3;
  
  // If the guide ID matches one of the primary guide IDs directly, use the name
  if (tour?.guide1Id === guideId && tour?.guide1) return tour.guide1;
  if (tour?.guide2Id === guideId && tour?.guide2) return tour.guide2;
  if (tour?.guide3Id === guideId && tour?.guide3) return tour.guide3;
  
  // Add more detailed logging for troubleshooting
  console.log("Could not find guide name for ID:", guideId, "Using fallback formatting");
  
  // Fallback for unknown IDs (should rarely happen)
  return guideId.startsWith("guide") ? `Guide ${guideId.slice(5)}` : `Guide (${guideId.substring(0, 6)}...)`;
};
