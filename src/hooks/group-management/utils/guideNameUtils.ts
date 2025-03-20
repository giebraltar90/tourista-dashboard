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
  
  // Check primary guides first
  if (guideId === "guide1") return tour.guide1 || "Guide 1";
  if (guideId === "guide2") return tour.guide2 || "Guide 2";
  if (guideId === "guide3") return tour.guide3 || "Guide 3";
  
  // Try to find guide by ID
  const guide = guides.find(g => g.id === guideId);
  if (guide) return guide.name;
  
  // Check if ID contains guide name (fallback)
  if (tour.guide1 && guideId.includes(tour.guide1)) return tour.guide1;
  if (tour.guide2 && guideId.includes(tour.guide2)) return tour.guide2;
  if (tour.guide3 && guideId.includes(tour.guide3)) return tour.guide3;
  
  // For UUID IDs, show a shortened version
  if (isValidUuid(guideId)) {
    return `Guide ${guideId.substring(0, 8)}...`;
  }
  
  return guideId;
};

/**
 * Generate a group name based on guide assignment and group index
 * Ensures each group gets a unique sequential number
 */
export const generateGroupName = (currentName: string, groupIndex: number): string => {
  // Always use standardized naming format with sequential numbering
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
  if (!actualGuideId) return "Unassigned";
  
  // Find the guide name using the utility function
  return findGuideName(actualGuideId, currentTour, guides);
};
