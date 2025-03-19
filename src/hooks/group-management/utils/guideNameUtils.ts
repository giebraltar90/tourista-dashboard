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
 * Generate a group name based on guide assignment
 */
export const generateGroupName = (currentName: string, guideName: string): string => {
  const namePattern = /^.+'s Group$/;
  
  // If the group name follows the pattern "X's Group", update it with new guide name
  // or if it's the first assignment or contains "Group", also update the name
  if (namePattern.test(currentName) || currentName.includes("Group")) {
    if (guideName && guideName !== "Unassigned") {
      return `${guideName}'s Group`;
    }
  }
  
  // Keep the existing name if we're removing a guide or couldn't find a pattern match
  return currentName;
};
