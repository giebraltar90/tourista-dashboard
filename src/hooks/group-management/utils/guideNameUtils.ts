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
  
  // Check primary guides first
  if (guideId === "guide1") return tour.guide1;
  if (guideId === "guide2") return tour.guide2 || "Guide 2";
  if (guideId === "guide3") return tour.guide3 || "Guide 3";
  
  // Try to find guide by ID
  const guide = guides.find(g => g.id === guideId);
  if (guide) return guide.name;
  
  // Check if ID contains guide name (fallback)
  if (tour.guide1 && guideId.includes(tour.guide1)) return tour.guide1;
  if (tour.guide2 && guideId.includes(tour.guide2)) return tour.guide2;
  if (tour.guide3 && guideId.includes(tour.guide3)) return tour.guide3;
  
  return guideId;
};

/**
 * Generate a group name based on guide assignment - 
 * IMPORTANT: This now preserves the existing name by default unless 
 * it's a default group name or explicitly following the guide naming pattern
 */
export const generateGroupName = (currentName: string, guideName: string): string => {
  // If we're unassigning (guideName is "Unassigned"), keep the current name
  if (guideName === "Unassigned") {
    return currentName;
  }
  
  // Only modify names that follow known patterns
  const namePattern = /^.+'s Group$/;
  const defaultGroupPattern = /^Group \d+$/;
  
  // Only modify the name if:
  // 1. It already follows the "[Name]'s Group" pattern
  // 2. It's a default "Group X" name
  // 3. It contains the word "Group" (likely a default or generated name)
  if (namePattern.test(currentName) || defaultGroupPattern.test(currentName) || 
      (currentName.includes("Group") && !currentName.includes("Custom"))) {
    return `${guideName}'s Group`;
  }
  
  // Otherwise, preserve the existing name
  return currentName;
};
