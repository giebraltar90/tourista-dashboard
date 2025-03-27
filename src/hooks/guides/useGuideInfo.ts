
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuides } from "../useGuides";
import { GuideInfo } from "@/types/ventrata";
import { useMemo } from "react";

/**
 * Hook to extract guide information from a tour
 */
export const useGuideInfo = (tour?: TourCardProps | null) => {
  const { guides, isLoading } = useGuides();
  
  return useMemo(() => {
    if (!tour || !guides || guides.length === 0) {
      return { guide1Info: null, guide2Info: null, guide3Info: null, isLoading };
    }

    // Find the guide objects that match the IDs in the tour
    const guide1Info = tour.guide1 
      ? guides.find(guide => guide.id === tour.guide1) as GuideInfo || null
      : null;
      
    const guide2Info = tour.guide2 
      ? guides.find(guide => guide.id === tour.guide2) as GuideInfo || null
      : null;
      
    const guide3Info = tour.guide3 
      ? guides.find(guide => guide.id === tour.guide3) as GuideInfo || null
      : null;

    return { guide1Info, guide2Info, guide3Info, isLoading };
  }, [tour, guides, isLoading]);
};
