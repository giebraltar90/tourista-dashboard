
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { useGuideData, Guide } from "@/hooks/guides/useGuideData";

interface GuideNameAndInfo {
  name: string;
  info: GuideInfo | null;
}

/**
 * Hook for getting guide name and info from guide ID
 */
export const useGuideNameInfo = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  const { guides = [] } = useGuideData() || { guides: [] };
  
  const getGuideNameAndInfo = (guideId?: string): GuideNameAndInfo => {
    // Handle undefined/empty case
    if (!guideId) {
      return {
        name: "Unassigned",
        info: null
      };
    }
    
    // Special case for "_none" value (used to remove a guide)
    if (guideId === "_none") {
      return {
        name: "Unassigned",
        info: null
      };
    }
    
    // Look for primary guides first by ID
    if (guideId === "guide1") {
      return {
        name: tour.guide1 || "Guide 1",
        info: guide1Info
      };
    }
    
    if (guideId === "guide2") {
      return {
        name: tour.guide2 || "Guide 2",
        info: guide2Info
      };
    }
    
    if (guideId === "guide3") {
      return {
        name: tour.guide3 || "Guide 3",
        info: guide3Info
      };
    }
    
    // Check for UUID format guide IDs
    if (isValidUuid(guideId)) {
      // Look in the guides array for a match
      const matchingGuide = guides.find(guide => guide.id === guideId);
      if (matchingGuide) {
        // Fix: Convert string birthday to Date if needed
        const birthday = typeof matchingGuide.birthday === 'string' 
          ? new Date(matchingGuide.birthday) 
          : (matchingGuide.birthday || new Date());
          
        return {
          name: matchingGuide.name,
          info: {
            name: matchingGuide.name,
            birthday: birthday,
            guideType: matchingGuide.guide_type || "GA Ticket"
          }
        };
      }
      
      // Check if this UUID matches one of the primary guides (when guides are stored as IDs)
      if (tour.guide1 === guideId) {
        return {
          name: guides.find(g => g.id === guideId)?.name || `Guide (${guideId.substring(0, 6)}...)`,
          info: guide1Info
        };
      }
      
      if (tour.guide2 === guideId) {
        return {
          name: guides.find(g => g.id === guideId)?.name || `Guide (${guideId.substring(0, 6)}...)`,
          info: guide2Info
        };
      }
      
      if (tour.guide3 === guideId) {
        return {
          name: guides.find(g => g.id === guideId)?.name || `Guide (${guideId.substring(0, 6)}...)`,
          info: guide3Info
        };
      }
      
      // If not found anywhere, return a formatted UUID
      return {
        name: `Guide (${guideId.substring(0, 6)}...)`,
        info: null
      };
    }
    
    // Last resort: check if the ID matches a guide name directly
    if (tour.guide1 === guideId) {
      return {
        name: guideId,
        info: guide1Info
      };
    }
    
    if (tour.guide2 === guideId) {
      return {
        name: guideId,
        info: guide2Info
      };
    }
    
    if (tour.guide3 === guideId) {
      return {
        name: guideId,
        info: guide3Info
      };
    }
    
    // If all else fails, use the ID itself
    return {
      name: guideId,
      info: null
    };
  };
  
  return { getGuideNameAndInfo };
};
