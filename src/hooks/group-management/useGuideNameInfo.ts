
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useCallback } from "react";

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
    
    // First try to match against known guide IDs
    const matchingGuide = [
      { id: tour.guide1, name: tour.guide1, info: guide1Info },
      { id: tour.guide2, name: tour.guide2, info: guide2Info },
      { id: tour.guide3, name: tour.guide3, info: guide3Info }
    ].find(g => g.id === guideId);
    
    if (matchingGuide) {
      return { name: matchingGuide.name || "Unassigned", info: matchingGuide.info };
    }
    
    // If we made it here, we don't know this guide
    return { name: `Guide (${guideId.substring(0, 4)}...)`, info: null };
  }, [tour, guide1Info, guide2Info, guide3Info]);
  
  return { getGuideNameAndInfo };
};
