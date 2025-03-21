
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
  console.log("GUIDE TICKET DEBUG: getGuideNameAndInfo called for guideId:", guideId, {
    guide1Name, guide2Name, guide3Name,
    guide1Info: guide1Info ? { id: guide1Info.id, name: guide1Info.name, guideType: guide1Info.guideType } : null,
    guide2Info: guide2Info ? { id: guide2Info.id, name: guide2Info.name, guideType: guide2Info.guideType } : null,
    guide3Info: guide3Info ? { id: guide3Info.id, name: guide3Info.name, guideType: guide3Info.guideType } : null,
    allGuidesCount: allGuides.length,
  });
  
  // If no guide ID, return unassigned
  if (!guideId) {
    return { name: "Unassigned", info: null };
  }
  
  // Handle specific guide IDs - use exact string comparison
  if (guideId === "guide1" && guide1Name) {
    console.log("GUIDE TICKET DEBUG: Matched guide1 by exact ID");
    return { name: guide1Name, info: guide1Info || null };
  }
  
  if (guideId === "guide2" && guide2Name) {
    console.log("GUIDE TICKET DEBUG: Matched guide2 by exact ID");
    return { name: guide2Name, info: guide2Info || null };
  }
  
  if (guideId === "guide3" && guide3Name) {
    console.log("GUIDE TICKET DEBUG: Matched guide3 by exact ID");
    return { name: guide3Name, info: guide3Info || null };
  }
  
  // Check if guideId directly matches one of the main guide IDs
  if (guide1Info && (guideId === guide1Info.id)) {
    console.log("GUIDE TICKET DEBUG: Matched guide1 by info.id");
    return { name: guide1Name || "Guide 1", info: guide1Info };
  }
  
  if (guide2Info && (guideId === guide2Info.id)) {
    console.log("GUIDE TICKET DEBUG: Matched guide2 by info.id");
    return { name: guide2Name || "Guide 2", info: guide2Info };
  }
  
  if (guide3Info && (guideId === guide3Info.id)) {
    console.log("GUIDE TICKET DEBUG: Matched guide3 by info.id");
    return { name: guide3Name || "Guide 3", info: guide3Info };
  }
  
  // Check if it's a UUID and try to find in all guides
  if (isValidUuid(guideId) && allGuides && allGuides.length > 0) {
    const guide = allGuides.find(g => g.id === guideId);
    if (guide) {
      console.log("GUIDE TICKET DEBUG: Matched guide from allGuides by UUID:", guide.name, guide.guideType);
      return { 
        name: guide.name || `Guide ${guideId.substring(0, 4)}...`, 
        info: {
          id: guide.id,
          name: guide.name || `Guide ${guideId.substring(0, 4)}...`,
          birthday: guide.birthday || new Date(),
          guideType: guide.guideType || "GA Ticket"
        } 
      };
    }
  }
  
  // If all else fails, return a formatted guide ID as the name
  console.log("GUIDE TICKET DEBUG: Could not match guide, returning fallback name");
  return { name: `Guide ${guideId.substring(0, 8)}...`, info: null };
};

// For backward compatibility and simpler usage
export const findGuideName = (
  guideId: string | undefined, 
  tourObj?: any, 
  guides: any[] = []
): string => {
  if (!guideId) return "Unassigned";
  
  const guide1Name = tourObj?.guide1;
  const guide2Name = tourObj?.guide2;
  const guide3Name = tourObj?.guide3;
  
  const result = getGuideNameAndInfo(
    guide1Name, guide2Name, guide3Name, null, null, null, guides, guideId
  );
  
  console.log("GUIDE TICKET DEBUG: findGuideName result for guideId:", guideId, "->", result.name);
  return result.name;
};
