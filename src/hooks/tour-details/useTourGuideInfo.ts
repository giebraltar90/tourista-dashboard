
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useGuideInfo } from "@/hooks/guides/useGuideInfo";
import { logger } from "@/utils/logger";

/**
 * Hook to fetch guide info for a tour
 */
export const useTourGuideInfo = (tour: TourCardProps | null | undefined) => {
  // Fetch guide1 info
  const { 
    data: guide1InfoData, 
    isLoading: isGuide1Loading 
  } = useGuideInfo(tour?.guide1_id || "");
  
  // Fetch guide2 info
  const { 
    data: guide2InfoData, 
    isLoading: isGuide2Loading 
  } = useGuideInfo(tour?.guide2_id || "");
  
  // Fetch guide3 info
  const { 
    data: guide3InfoData, 
    isLoading: isGuide3Loading 
  } = useGuideInfo(tour?.guide3_id || "");
  
  // Create guide info objects
  const guide1Info: GuideInfo | null = guide1InfoData || (tour?.guide1 ? {
    name: tour.guide1,
    guideType: "GA Ticket", // Default guide type if not specified 
    id: tour.guide1_id
  } : null);
  
  const guide2Info: GuideInfo | null = guide2InfoData || (tour?.guide2 ? {
    name: tour.guide2,
    guideType: "GA Ticket", // Default guide type if not specified
    id: tour.guide2_id
  } : null);
  
  const guide3Info: GuideInfo | null = guide3InfoData || (tour?.guide3 ? {
    name: tour.guide3,
    guideType: "GA Ticket", // Default guide type if not specified
    id: tour.guide3_id
  } : null);

  // Log guide info for debugging
  logger.debug("Tour guide info loaded:", {
    guide1: guide1Info?.name,
    guide1Type: guide1Info?.guideType,
    guide2: guide2Info?.name,
    guide2Type: guide2Info?.guideType,
    guide3: guide3Info?.name,
    guide3Type: guide3Info?.guideType,
  });
  
  return {
    guide1Info,
    guide2Info,
    guide3Info,
    isLoading: isGuide1Loading || isGuide2Loading || isGuide3Loading
  };
};
