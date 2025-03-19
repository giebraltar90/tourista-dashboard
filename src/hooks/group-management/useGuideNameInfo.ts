
import { GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";

/**
 * Hook to get guide name and info based on guide ID
 */
export const useGuideNameInfo = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  // Helper to get guide name for display
  const getGuideNameAndInfo = (guideId?: string) => {
    // Default fallback case
    if (!guideId || guideId === "_none") return { name: "Unassigned", info: null };
    
    // For primary guides, check both the ID pattern and direct matches
    if (guideId === "guide1" || (tour.guide1 && guideId === tour.guide1)) {
      return { name: tour.guide1, info: guide1Info };
    } 
    
    if (guideId === "guide2" || (tour.guide2 && guideId === tour.guide2)) {
      return { name: tour.guide2 || "", info: guide2Info };
    }
    
    if (guideId === "guide3" || (tour.guide3 && guideId === tour.guide3)) {
      return { name: tour.guide3 || "", info: guide3Info };
    }
    
    // Additional checks for guides that might use full names as IDs
    if (tour.guide1 && guideId.includes(tour.guide1)) {
      return { name: tour.guide1, info: guide1Info };
    }
    
    if (tour.guide2 && guideId.includes(tour.guide2)) {
      return { name: tour.guide2, info: guide2Info };
    }
    
    if (tour.guide3 && guideId.includes(tour.guide3)) {
      return { name: tour.guide3, info: guide3Info };
    }
    
    // If we still couldn't find a match, return the ID as name
    return { name: guideId, info: null };
  };
  
  return { getGuideNameAndInfo };
};
