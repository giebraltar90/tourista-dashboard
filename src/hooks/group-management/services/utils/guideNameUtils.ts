
import { TourCardProps } from "@/components/tours/tour-card/types";

/**
 * Finds the guide name based on guide ID from tour object or guides array
 */
export const findGuideName = (
  guideId: string | undefined,
  tour: Pick<TourCardProps, 'guide1' | 'guide2'>,
  guides: Array<{ id: string; name: string }> = []
): string => {
  if (!guideId) return "No guide assigned";
  
  // Check if guideId matches one of the main tour guides
  if (tour.guide1 && guideId.includes(tour.guide1)) return tour.guide1;
  if (tour.guide2 && guideId.includes(tour.guide2)) return tour.guide2;
  
  // If guide ID matches a known guide in the guides array, return that
  const matchedGuide = guides.find(g => g.id === guideId);
  if (matchedGuide) return matchedGuide.name;
  
  // Return the ID as a fallback
  return guideId;
};

/**
 * Generate a group name that includes the guide if assigned
 */
export const generateGroupName = (
  baseGroupName: string,
  guideId: string | undefined,
  tour: Pick<TourCardProps, 'guide1' | 'guide2'>,
  guides: Array<{ id: string; name: string }> = []
): string => {
  if (!guideId) return baseGroupName;
  
  const guideName = findGuideName(guideId, tour, guides);
  if (guideName === guideId) return baseGroupName; // Don't include ID in the name
  
  return `${baseGroupName} (${guideName})`;
};
