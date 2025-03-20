
/**
 * Find guide name from ID using multiple lookup strategies
 */
export const findGuideName = (
  guideId: string | null | undefined,
  guides: any[],
  tour: any
): string => {
  // Default name if no guide is assigned
  if (!guideId) {
    return "Unassigned";
  }
  
  // Try to find guide name in the guides array first
  const guide = guides.find(g => g.id === guideId);
  if (guide) {
    return guide.name;
  }
  
  // Fallback to looking in tour properties
  if (tour) {
    if (guideId === "guide1" && tour.guide1) return tour.guide1;
    if (guideId === "guide2" && tour.guide2) return tour.guide2;
    if (guideId === "guide3" && tour.guide3) return tour.guide3;
    
    // Try harder to find the name
    if (tour.guide1 && guides.find(g => g.name === tour.guide1)?.id === guideId) {
      return tour.guide1;
    } else if (tour.guide2 && guides.find(g => g.name === tour.guide2)?.id === guideId) {
      return tour.guide2;
    } else if (tour.guide3 && guides.find(g => g.name === tour.guide3)?.id === guideId) {
      return tour.guide3;
    }
  }
  
  // Last resort fallback
  return guideId.startsWith("guide") ? `Guide ${guideId.slice(5)}` : guideId.substring(0, 8);
};

/**
 * Generate a new group name that includes the guide if assigned
 */
export const generateGroupNameWithGuide = (
  groupNumber: number,
  guideName: string | null | undefined
): string => {
  return guideName && guideName !== "Unassigned"
    ? `Group ${groupNumber} (${guideName})`
    : `Group ${groupNumber}`;
};

/**
 * Create a human-readable description for the guide assignment operation
 */
export const createModificationDescription = (
  actualGuideId: string | null | undefined,
  guideName: string,
  groupNumber: number
): string => {
  return actualGuideId
    ? `Assigned guide ${guideName} to Group ${groupNumber}`
    : `Removed guide from Group ${groupNumber}`;
};
