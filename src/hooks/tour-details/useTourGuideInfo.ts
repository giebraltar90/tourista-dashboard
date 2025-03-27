
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useGuideInfo } from "@/hooks/guides/useGuideInfo";
import { logger } from "@/utils/logger";
import { useEffect } from "react";

/**
 * Hook to fetch guide info for a tour
 */
export const useTourGuideInfo = (tour: TourCardProps | null | undefined) => {
  // If tour is null or undefined, we'll use empty strings for guide IDs
  const guide1Id = tour?.guide1 || "";
  const guide2Id = tour?.guide2 || "";
  const guide3Id = tour?.guide3 || "";
  
  // Log guide IDs for debugging
  useEffect(() => {
    if (tour) {
      logger.debug("Tour guide IDs:", { guide1Id, guide2Id, guide3Id });
    }
  }, [tour, guide1Id, guide2Id, guide3Id]);
  
  // Fetch guide1 info
  const { 
    data: guide1InfoData, 
    isLoading: isGuide1Loading,
    error: guide1Error
  } = useGuideInfo(guide1Id);
  
  // Fetch guide2 info
  const { 
    data: guide2InfoData, 
    isLoading: isGuide2Loading,
    error: guide2Error
  } = useGuideInfo(guide2Id);
  
  // Fetch guide3 info
  const { 
    data: guide3InfoData, 
    isLoading: isGuide3Loading,
    error: guide3Error
  } = useGuideInfo(guide3Id);
  
  // Log any errors
  useEffect(() => {
    if (guide1Error) logger.error("Error fetching guide1 info:", guide1Error);
    if (guide2Error) logger.error("Error fetching guide2 info:", guide2Error);
    if (guide3Error) logger.error("Error fetching guide3 info:", guide3Error);
  }, [guide1Error, guide2Error, guide3Error]);
  
  // Create guide info objects
  const guide1Info: GuideInfo | null = guide1InfoData || (guide1Id ? {
    id: guide1Id,
    name: `Guide ${guide1Id.substring(0, 6)}`,
    guideType: "GA Ticket" // Default guide type if not specified 
  } : null);
  
  const guide2Info: GuideInfo | null = guide2InfoData || (guide2Id ? {
    id: guide2Id,
    name: `Guide ${guide2Id.substring(0, 6)}`,
    guideType: "GA Ticket" // Default guide type if not specified
  } : null);
  
  const guide3Info: GuideInfo | null = guide3InfoData || (guide3Id ? {
    id: guide3Id,
    name: `Guide ${guide3Id.substring(0, 6)}`,
    guideType: "GA Ticket" // Default guide type if not specified
  } : null);
  
  // Combine loading states
  const isLoading = isGuide1Loading || isGuide2Loading || isGuide3Loading;
  
  return { 
    guide1Info, 
    guide2Info, 
    guide3Info,
    isLoading
  };
};
