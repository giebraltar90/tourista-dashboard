
import { GuideInfo } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Find guide name based on guide ID
 */
export const findGuideName = (
  guideId?: string,
  tour?: any,
  guides: Array<{id: string, name: string}> = []
): string => {
  if (!guideId || guideId === "_none") return "Unassigned";
  if (!tour) return "Unknown";
  
  // Check primary guides first - these are special cases we handle explicitly
  if (guideId === "guide1" && tour.guide1) return tour.guide1;
  if (guideId === "guide2" && tour.guide2) return tour.guide2;
  if (guideId === "guide3" && tour.guide3) return tour.guide3;
  
  // Try to find guide by ID in the guides array
  const guide = guides.find(g => g.id === guideId);
  if (guide && guide.name) return guide.name;
  
  // For UUID-format guideIds, try to find a matching guide
  if (isValidUuid(guideId)) {
    // First check if this UUID directly matches one of the primary guides
    // This is for when guide1/guide2/guide3 are actually UUIDs instead of names
    if (tour.guide1 === guideId && guides.length > 0) {
      const foundGuide = guides.find(g => g.id === guideId);
      if (foundGuide) return foundGuide.name;
    }
    
    if (tour.guide2 === guideId && guides.length > 0) {
      const foundGuide = guides.find(g => g.id === guideId);
      if (foundGuide) return foundGuide.name;
    }
    
    if (tour.guide3 === guideId && guides.length > 0) {
      const foundGuide = guides.find(g => g.id === guideId);
      if (foundGuide) return foundGuide.name;
    }
    
    // Try to find the guide in the guides array
    const matchingGuide = guides.find(g => g.id === guideId);
    if (matchingGuide) return matchingGuide.name;
    
    // If we can't find a name, show a truncated version of the UUID
    console.log(`Could not find guide name for UUID: ${guideId}`);
    
    return `Guide (${guideId.substring(0, 6)}...)`;
  }
  
  // If we made it here, we don't know this guide
  return guideId.length > 10 ? `Guide (${guideId.substring(0, 6)}...)` : guideId;
};

/**
 * Generate a group name based on guide assignment - 
 * Now uses sequential numbering
 */
export const generateGroupName = (currentName: string, groupIndex: number): string => {
  // Always use standardized naming format
  return `Group ${groupIndex + 1}`;
};

/**
 * Get guide name for assignment records and modifications
 */
export const getGuideNameForAssignment = (
  actualGuideId: string | undefined,
  currentTour: any,
  guides: any[]
): string => {
  // For unassignment, use a standard name
  if (!actualGuideId || actualGuideId === "_none") return "Unassigned";
  
  // Handle special guide IDs directly
  if (actualGuideId === "guide1" && currentTour.guide1) {
    return currentTour.guide1;
  } else if (actualGuideId === "guide2" && currentTour.guide2) {
    return currentTour.guide2;
  } else if (actualGuideId === "guide3" && currentTour.guide3) {
    return currentTour.guide3;
  }
  
  // Find the guide name using the utility function for other IDs
  return findGuideName(actualGuideId, currentTour, guides);
};

