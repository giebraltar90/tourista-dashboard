
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo, GuideType } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { logger } from "@/utils/logger";

export interface GuideNameAndInfo {
  name: string;
  info: GuideInfo | null;
}

/**
 * Hook for getting guide name and info from guide ID
 */
export const useGuideNameInfo = (
  tour: any,
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
    
    // Logging to debug guide finding process
    logger.debug("Looking for guide with ID:", guideId, {
      tourDetails: {
        guide1: tour?.guide1,
        guide2: tour?.guide2, 
        guide3: tour?.guide3,
        guide1Id: tour?.guide1Id || tour?.guide1_id,
        guide2Id: tour?.guide2Id || tour?.guide2_id,
        guide3Id: tour?.guide3Id || tour?.guide3_id
      },
      guideInfos: {
        guide1InfoExists: !!guide1Info,
        guide2InfoExists: !!guide2Info,
        guide3InfoExists: !!guide3Info
      }
    });
    
    // Look for primary guides first by ID
    // Support both camelCase and snake_case property names
    if (guideId === "guide1" || guideId === tour?.guide1Id || guideId === tour?.guide1_id) {
      return {
        name: tour?.guide1 || "Guide 1",
        info: guide1Info
      };
    }
    
    if (guideId === "guide2" || guideId === tour?.guide2Id || guideId === tour?.guide2_id) {
      return {
        name: tour?.guide2 || "Guide 2",
        info: guide2Info
      };
    }
    
    if (guideId === "guide3" || guideId === tour?.guide3Id || guideId === tour?.guide3_id) {
      return {
        name: tour?.guide3 || "Guide 3",
        info: guide3Info
      };
    }
    
    // Check for UUID format guide IDs
    if (isValidUuid(guideId)) {
      // Look in the guides array for a match
      const matchingGuide = guides.find(guide => guide.id === guideId);
      if (matchingGuide) {
        // Fix: Make sure we're using the correct GuideType
        const guideType: GuideType = (matchingGuide.guide_type || "GA Ticket") as GuideType;
          
        return {
          name: matchingGuide.name,
          info: {
            id: matchingGuide.id,
            name: matchingGuide.name,
            guideType: guideType
          }
        };
      }
      
      // Check if the UUID matches one of the main guide IDs
      if (guideId === tour?.guide1Id || guideId === tour?.guide1_id) {
        return {
          name: tour?.guide1 || "Guide 1",
          info: guide1Info
        };
      }
      
      if (guideId === tour?.guide2Id || guideId === tour?.guide2_id) {
        return {
          name: tour?.guide2 || "Guide 2",
          info: guide2Info
        };
      }
      
      if (guideId === tour?.guide3Id || guideId === tour?.guide3_id) {
        return {
          name: tour?.guide3 || "Guide 3",
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
    if (tour?.guide1 === guideId) {
      return {
        name: guideId,
        info: guide1Info
      };
    }
    
    if (tour?.guide2 === guideId) {
      return {
        name: guideId,
        info: guide2Info
      };
    }
    
    if (tour?.guide3 === guideId) {
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
