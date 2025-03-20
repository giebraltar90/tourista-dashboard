
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useCallback } from "react";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Hook to get guide name and info when only guideId is available
 */
export const useGuideNameInfo = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  /**
   * Get guide name and info from guideId
   */
  const getGuideNameAndInfo = useCallback((guideId?: string) => {
    // If no guideId, return "Unassigned"
    if (!guideId) {
      return { name: "Unassigned", info: null };
    }
    
    // Handle special guide IDs
    if (guideId === "guide1") {
      return { 
        name: tour.guide1 || "Unassigned", 
        info: guide1Info 
      };
    }
    
    if (guideId === "guide2") {
      return { 
        name: tour.guide2 || "Unassigned", 
        info: guide2Info 
      };
    }
    
    if (guideId === "guide3") {
      return { 
        name: tour.guide3 || "Unassigned", 
        info: guide3Info 
      };
    }
    
    // For UUID guide IDs, we need to check multiple places
    if (isValidUuid(guideId)) {
      // First try to match against known guide IDs
      if (tour.guide1 && isValidUuid(tour.guide1) && tour.guide1 === guideId) {
        return { name: tour.guide1, info: guide1Info };
      }
      
      if (tour.guide2 && isValidUuid(tour.guide2) && tour.guide2 === guideId) {
        return { name: tour.guide2, info: guide2Info };
      }
      
      if (tour.guide3 && isValidUuid(tour.guide3) && tour.guide3 === guideId) {
        return { name: tour.guide3, info: guide3Info };
      }
      
      // If we made it here, display a shortened UUID
      return { 
        name: `Guide (${guideId.substring(0, 6)}...)`, 
        info: null 
      };
    }
    
    // If we made it here, just return the guideId as the name
    return { name: guideId, info: null };
  }, [tour, guide1Info, guide2Info, guide3Info]);
  
  return { getGuideNameAndInfo };
};
