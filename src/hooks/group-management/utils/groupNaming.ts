
/**
 * Finds the name of a guide based on their ID
 */
export const findGuideName = (
  guideId: string | undefined | null, 
  guides: any[] = [], 
  tour: any
): string => {
  if (!guideId) return "Unassigned";
  
  // Check in guides array first by ID
  const guideById = guides.find(g => g.id === guideId);
  if (guideById && guideById.name) return guideById.name;
  
  // Check standard guide references
  if (tour) {
    if (guideId === "guide1" || guideId === tour.guide1) return tour.guide1 || "Primary Guide";
    if (guideId === "guide2" || guideId === tour.guide2) return tour.guide2 || "Secondary Guide";
    if (guideId === "guide3" || guideId === tour.guide3) return tour.guide3 || "Assistant Guide";
  }
  
  // If we can't find a name, use a truncated version of the UUID
  if (typeof guideId === 'string' && guideId.length > 8) {
    return `Guide (${guideId.substring(0, 6)}...)`;
  }
  
  return "Unknown Guide";
};

/**
 * Generates a group name with the guide's name
 */
export const generateGroupNameWithGuide = (groupNumber: number, guideName: string | null): string => {
  if (!guideName || guideName === "Unassigned") {
    return `Group ${groupNumber}`;
  }
  
  return `Group ${groupNumber} (${guideName})`;
};

/**
 * Creates a descriptive modification message for guide assignment
 */
export const createModificationDescription = (
  guideId: string | null, 
  guideName: string, 
  groupNumber: number
): string => {
  if (!guideId) {
    return `Removed guide from Group ${groupNumber}`;
  }
  
  return `Assigned guide ${guideName} to Group ${groupNumber}`;
};
