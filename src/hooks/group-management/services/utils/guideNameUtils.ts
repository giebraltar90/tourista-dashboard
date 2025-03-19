
import { findGuideName } from "../../utils/guideNameUtils";
import { GuideInfo } from "@/types/ventrata";

/**
 * Gets the guide name for a specific guide ID
 */
export const getGuideNameForAssignment = (
  actualGuideId: string | undefined,
  currentTour: any,
  guides: GuideInfo[]
): string => {
  return actualGuideId ? findGuideName(
    actualGuideId, 
    currentTour, 
    Array.isArray(guides) ? guides.map(g => ({ id: g.id || "", name: g.name })) : []
  ) : "Unassigned";
};
