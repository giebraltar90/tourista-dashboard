
import { GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo } from "@/hooks/guides/useGuideInfo";
import { useMemo } from "react";

/**
 * Custom hook to fetch guide information for a tour
 */
export function useTourGuideInfo(tour: TourCardProps | null) {
  // Only call useGuideInfo when guide IDs exist
  const guide1Info = tour?.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour?.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour?.guide3 ? useGuideInfo(tour.guide3) : null;
  
  // Use useMemo to return a stable object reference
  return useMemo(() => ({
    guide1Info,
    guide2Info,
    guide3Info
  }), [guide1Info, guide2Info, guide3Info]);
}
