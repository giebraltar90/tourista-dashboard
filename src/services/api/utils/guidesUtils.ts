
/**
 * Validate if a string is a valid UUID
 */
export const isValidUuid = (id: string | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Alias for isValidUuid for backward compatibility
 */
export const isUuid = isValidUuid;

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
      guide1: tour.guide1,
      guide2: tour.guide2,
      guide3: tour.guide3
    } : 'Tour data not available'
  });
  
  // If it's already a UUID, return it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // If there's no tour data, just return null for special IDs
  if (!tour) return null;
  
  // Try to find the guide in the guides list by name
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
  
  // Check if one of the main guide IDs is already a UUID and matches
  if (isValidUuid(tour.guide1) && guideId === "guide1") return tour.guide1;
  if (isValidUuid(tour.guide2) && guideId === "guide2") return tour.guide2;
  if (isValidUuid(tour.guide3) && guideId === "guide3") return tour.guide3;
  
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
    availableGuides: guides.length
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
  
  // Add more detailed logging for troubleshooting
  console.log("Could not find guide name for ID:", guideId, "Using fallback formatting");
  
  // Fallback for unknown IDs (should rarely happen)
  return guideId.startsWith("guide") ? `Guide ${guideId.slice(5)}` : `Guide (${guideId.substring(0, 6)}...)`;
};

/**
 * Format a UUID as a readable ID for display
 */
export const formatGuideId = (id: string | undefined): string => {
  if (!id) return "Unknown";
  if (isValidUuid(id)) {
    return `${id.substring(0, 8)}...`;
  }
  return id;
};
