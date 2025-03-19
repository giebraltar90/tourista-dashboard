
import { GuideInfo } from "@/types/ventrata";
import { isUuid } from "@/services/api/tour/guideUtils";

/**
 * Helper function to get guide name for display based on guide ID
 */
export const getGuideNameAndInfo = (
  tourGuide1: string | undefined,
  tourGuide2: string | undefined,
  tourGuide3: string | undefined,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  guides: GuideInfo[] = [],
  guideId?: string
) => {
  // Default fallback case
  if (!guideId || guideId === "_none") return { name: "Unassigned", info: null };
  
  // For primary guides, check both the ID pattern and direct matches
  if (guideId === "guide1" || (tourGuide1 && guideId === tourGuide1)) {
    return { name: tourGuide1 || "", info: guide1Info };
  } 
  
  if (guideId === "guide2" || (tourGuide2 && guideId === tourGuide2)) {
    return { name: tourGuide2 || "", info: guide2Info };
  }
  
  if (guideId === "guide3" || (tourGuide3 && guideId === tourGuide3)) {
    return { name: tourGuide3 || "", info: guide3Info };
  }
  
  // Check if this is a UUID and look for a match in the guides list
  if (isUuid(guideId)) {
    const guideMatch = guides.find(g => g.id === guideId);
    if (guideMatch) {
      return { name: guideMatch.name, info: guideMatch };
    }
  }
  
  // Additional checks for guides that might use full names as IDs
  if (tourGuide1 && (typeof guideId === 'string') && guideId.includes(tourGuide1)) {
    return { name: tourGuide1, info: guide1Info };
  }
  
  if (tourGuide2 && (typeof guideId === 'string') && guideId.includes(tourGuide2)) {
    return { name: tourGuide2, info: guide2Info };
  }
  
  if (tourGuide3 && (typeof guideId === 'string') && guideId.includes(tourGuide3)) {
    return { name: tourGuide3, info: guide3Info };
  }
  
  // If we still couldn't find a match, return the ID as name but format it nicely
  const displayName = isUuid(guideId) ? 
    `Unknown (${guideId.substring(0, 8)}...)` : 
    (typeof guideId === 'string' ? guideId : "Unknown");
    
  return { name: displayName, info: null };
};
