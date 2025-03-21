
import { GuideInfo } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Gets the guide name and info based on the guide ID
 */
export const getGuideNameAndInfo = (
  guide1Name?: string,
  guide2Name?: string,
  guide3Name?: string,
  guide1Info?: GuideInfo | null,
  guide2Info?: GuideInfo | null,
  guide3Info?: GuideInfo | null,
  allGuides: any[] = [],
  guideId?: string
): { name: string; info: GuideInfo | null } => {
  // If no guide ID, return unassigned
  if (!guideId) {
    return { name: "Unassigned", info: null };
  }
  
  // Handle specific guide IDs - use exact string comparison
  if (guideId === "guide1" && guide1Name) {
    return { name: guide1Name, info: guide1Info || null };
  }
  
  if (guideId === "guide2" && guide2Name) {
    return { name: guide2Name, info: guide2Info || null };
  }
  
  if (guideId === "guide3" && guide3Name) {
    return { name: guide3Name, info: guide3Info || null };
  }
  
  // Check if it's a UUID and try to find in all guides
  if (isValidUuid(guideId) && allGuides && allGuides.length > 0) {
    const guide = allGuides.find(g => g.id === guideId);
    if (guide) {
      return { 
        name: guide.name || `Guide ${guideId.substring(0, 4)}...`, 
        info: {
          name: guide.name || `Guide ${guideId.substring(0, 4)}...`,
          birthday: guide.birthday || new Date(),
          guideType: guide.guideType || "GA Ticket"
        } 
      };
    }
  }
  
  // If all else fails, return a formatted guide ID as the name
  return { name: `Guide ${guideId.substring(0, 8)}...`, info: null };
};

// For backward compatibility, let's add this function
export const findGuideName = (guideId: string | undefined, guides: any[] = []): string => {
  const result = getGuideNameAndInfo(undefined, undefined, undefined, null, null, null, guides, guideId);
  return result.name;
};
