
import { GuideInfo } from "@/types/ventrata";

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
  
  // Try to find guide by ID
  const guide = guides.find(g => g.id === guideId);
  if (guide && guide.name) return guide.name;
  
  // Check if ID contains guide name (fallback)
  if (tour.guide1 && guideId.includes(tour.guide1)) return tour.guide1;
  if (tour.guide2 && guideId.includes(tour.guide2)) return tour.guide2;
  if (tour.guide3 && guideId.includes(tour.guide3)) return tour.guide3;
  
  // As a last resort, just return the ID with a prefix
  return `Guide (${guideId.substring(0, 6)}...)`;
};

/**
 * Generate a group name based on guide assignment - 
 * IMPORTANT: This now preserves all existing names
 */
export const generateGroupName = (currentName: string, guideName: string): string => {
  // NEVER change the current name automatically - always preserve it
  return currentName;
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
  if (!actualGuideId) return "Unassigned";
  
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
