
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
    if (!guideId) return { name: "Unassigned", info: null };
    
    if ((guideId === "guide1" || guideId === guide1Info?.id) && guide1Info) {
      return { name: tour.guide1, info: guide1Info };
    } else if ((guideId === "guide2" || guideId === guide2Info?.id) && guide2Info) {
      return { name: tour.guide2 || "", info: guide2Info };
    } else if ((guideId === "guide3" || guideId === guide3Info?.id) && guide3Info) {
      return { name: tour.guide3 || "", info: guide3Info };
    }
    
    return { name: "Unassigned", info: null };
  };
  
  return { getGuideNameAndInfo };
};
