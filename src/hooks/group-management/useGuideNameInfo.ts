
import { GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideData } from "@/hooks/useGuideData";
import { getGuideNameAndInfo } from "./utils/guideInfoUtils";

/**
 * Hook to get guide name and info based on guide ID
 */
export const useGuideNameInfo = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  const { guides = [] } = useGuideData() || { guides: [] };
  
  const getGuideInfo = (guideId?: string) => {
    return getGuideNameAndInfo(
      tour.guide1,
      tour.guide2,
      tour.guide3,
      guide1Info,
      guide2Info,
      guide3Info,
      guides,
      guideId
    );
  };
  
  return { getGuideNameAndInfo: getGuideInfo };
};
