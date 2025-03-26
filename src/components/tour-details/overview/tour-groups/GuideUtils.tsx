
import { Guide, GuideInfo, GuideType } from "@/types/ventrata";

/**
 * Utility function to find and get guide name and info
 */
export const getGuideNameAndInfo = (guides: Guide[], guideId?: string): { name: string; info: any } => {
  if (!guideId) {
    return { name: "Unassigned", info: null };
  }
  
  // Try to find the guide by ID
  const guide = guides.find(g => g.id === guideId);
  
  // If we found a guide, return its name and info
  if (guide) {
    return { 
      name: guide.name || "Unnamed Guide", 
      info: {
        guideType: guide.guide_type,
        // Safely handle potentially null or undefined birthday
        birthday: guide.birthday ? new Date(guide.birthday) : null
      }
    };
  }
  
  // If the guide isn't found but there is a guideId
  return { name: "Unknown Guide", info: null };
};
