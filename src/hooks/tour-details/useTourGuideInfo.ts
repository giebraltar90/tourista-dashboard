
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useGuideInfo } from "@/hooks/guides/useGuideInfo";
import { logger } from "@/utils/logger";

/**
 * Hook to fetch guide info for a tour
 */
export const useTourGuideInfo = (tour: TourCardProps | null | undefined) => {
  // If tour is null or undefined, we'll use empty strings for guide IDs
  const guide1Id = tour?.guide1 || "";
  const guide2Id = tour?.guide2 || "";
  const guide3Id = tour?.guide3 || "";
  
  // Fetch guide1 info
  const { 
    data: guide1InfoData, 
    isLoading: isGuide1Loading 
  } = useGuideInfo(guide1Id);
  
  // Fetch guide2 info
  const { 
    data: guide2InfoData, 
    isLoading: isGuide2Loading 
  } = useGuideInfo(guide2Id);
  
  // Fetch guide3 info
  const { 
    data: guide3InfoData, 
    isLoading: isGuide3Loading 
  } = useGuideInfo(guide3Id);
  
  // Create guide info objects
  const guide1Info: GuideInfo | null = guide1InfoData || (tour?.guide1 ? {
    id: guide1Id,
    name: tour.guide1,
    guideType: "GA Ticket" // Default guide type if not specified 
  } : null);
  
  const guide2Info: GuideInfo | null = guide2InfoData || (tour?.guide2 ? {
    id: guide2Id,
    name: tour.guide2,
    guideType: "GA Ticket" // Default guide type if not specified
  } : null);
  
  const guide3Info: GuideInfo | null = guide3InfoData || (tour?.guide3 ? {
    id: guide3Id,
    name: tour.guide3,
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
