
import { GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { isUuid } from "@/services/api/tour/guideUtils";
import { useGuideData } from "@/hooks/useGuideData";

/**
 * Hook to get guide name and info based on guide ID
 */
export const useGuideNameInfo = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  const { guides } = useGuideData();
  
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
    
    // Check if this is a UUID and look for a match in the guides list
    if (isUuid(guideId)) {
      const guideMatch = guides.find(g => g.id === guideId);
      if (guideMatch) {
        return { name: guideMatch.name, info: guideMatch };
      }
    }
    
    // Additional checks for guides that might use full names as IDs
    if (tour.guide1 && (typeof guideId === 'string') && guideId.includes(tour.guide1)) {
      return { name: tour.guide1, info: guide1Info };
    }
    
    if (tour.guide2 && (typeof guideId === 'string') && guideId.includes(tour.guide2)) {
      return { name: tour.guide2, info: guide2Info };
    }
    
    if (tour.guide3 && (typeof guideId === 'string') && guideId.includes(tour.guide3)) {
      return { name: tour.guide3, info: guide3Info };
    }
    
    // If we still couldn't find a match, return the ID as name but format it nicely
    const displayName = isUuid(guideId) ? 
      `Unknown (${guideId.substring(0, 8)}...)` : 
      (typeof guideId === 'string' ? guideId : "Unknown");
      
    return { name: displayName, info: null };
  };
  
  return { getGuideNameAndInfo };
};
