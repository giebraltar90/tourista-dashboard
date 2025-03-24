
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
    // Check if this matches one of the primary guides' IDs
    if (tour.guide1Id === guideId) return tour.guide1 || "Guide 1";
    if (tour.guide2Id === guideId) return tour.guide2 || "Guide 2";
    if (tour.guide3Id === guideId) return tour.guide3 || "Guide 3";
    
    // Try to find the guide in the guides array
    const matchingGuide = guides.find(g => g.id === guideId);
    if (matchingGuide) return matchingGuide.name;
    
    // If we can't find a name, show a truncated version of the UUID
    return `Guide (${guideId.substring(0, 6)}...)`;
  }
  
  // If we made it here, we don't know this guide
  return guideId.length > 10 ? `Guide (${guideId.substring(0, 6)}...)` : guideId;
};

/**
 * Generate a group name based on group index
 * Maintains consistent group numbering regardless of rendering order
 */
export const generateGroupName = (existingGroups: any[], groupIndex: number): string => {
  // Extract the original group number if it exists in the name
  if (existingGroups[groupIndex]?.name) {
    const match = existingGroups[groupIndex].name.match(/Group (\d+)/);
    if (match && match[1]) {
      return `Group ${match[1]}`;
    }
  }
  
  // Use the index if no existing name pattern found (adding 1 for human-readable numbering)
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
