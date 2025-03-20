
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
  const getGuideNameAndInfo = (guideId?: string): GuideNameAndInfo => {
    // Handle undefined/empty case
    if (!guideId) {
      return {
        name: "Unassigned",
        info: null
      };
    }
    
    console.log("Resolving name for guideId:", guideId);
    
    // Look for primary guides first
    // Check guide1
    if (guideId === "guide1" || guideId === tour.guide1 || (tour.guide1 && guideId === tour.guide1_id)) {
      return {
        name: tour.guide1 || "Guide 1",
        info: guide1Info
      };
    }
    
    // Check guide2
    if (guideId === "guide2" || guideId === tour.guide2 || (tour.guide2 && guideId === tour.guide2_id)) {
      return {
        name: tour.guide2 || "Guide 2",
        info: guide2Info
      };
    }
    
    // Check guide3
    if (guideId === "guide3" || guideId === tour.guide3 || (tour.guide3 && guideId === tour.guide3_id)) {
      return {
        name: tour.guide3 || "Guide 3",
        info: guide3Info
      };
    }
    
    // Special case for "_none" value (used to remove a guide)
    if (guideId === "_none") {
      return {
        name: "Unassigned",
        info: null
      };
    }
    
    // For UUID guides, try to find them in the tour groups
    if (isValidUuid(guideId)) {
      // Search in tour groups for a match
      const matchingGroup = tour.tourGroups?.find(group => group.guideId === guideId);
      if (matchingGroup) {
        // Extract the guide name from the group name if possible
        const nameParts = matchingGroup.name.match(/\((.*?)\)/);
        if (nameParts && nameParts[1]) {
          return {
            name: nameParts[1],
            info: null
          };
        }
      }
      
      // If all primary guides are checked but UUID still not found, check if it matches any primary guide ID
      if (tour.guide1_id === guideId) return { name: tour.guide1 || "Unknown Guide", info: guide1Info };
      if (tour.guide2_id === guideId) return { name: tour.guide2 || "Unknown Guide", info: guide2Info };
      if (tour.guide3_id === guideId) return { name: tour.guide3 || "Unknown Guide", info: guide3Info };
    }
    
    // If we still haven't found a match, just use the ID as a fallback
    if (isValidUuid(guideId)) {
      return {
        name: `Guide (${guideId.substring(0, 6)}...)`,
        info: null
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
