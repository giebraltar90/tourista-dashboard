
import { useGuideInfo } from "@/hooks/guides/useGuideInfo";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useMemo } from "react";

/**
 * Custom hook to fetch guide information for a tour
 */
export function useTourGuideInfo(tour: TourCardProps | null) {
  // Safely handle guide queries for each guide
  const guide1Info = tour?.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour?.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour?.guide3 ? useGuideInfo(tour.guide3) : null;
  
  // Memoize the result to prevent unnecessary re-renders
  return useMemo(() => ({
    guide1Info,
    guide2Info,
    guide3Info
  }), [guide1Info, guide2Info, guide3Info]);
}
