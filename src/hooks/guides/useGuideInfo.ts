
import { useGuideData } from "./useGuideData";
import { GuideInfo } from "@/types/ventrata";

/**
 * Returns information about a guide based on the guide name
 */
export const useGuideInfo = (guideName: string): GuideInfo | null => {
  // Safely access the guides data
  const { guides = [] } = useGuideData() || { guides: [] };
  
  if (!guideName || !Array.isArray(guides)) {
    return null;
  }

  // Find the guide by name
  const guide = guides.find(g => g.name === guideName);
  
  if (!guide) {
    // Return a fallback object with just the name if guide not found
    return {
      name: guideName,
      birthday: new Date(),
      guideType: "GA Ticket" // Default type
    };
  }

  return {
    name: guide.name,
    birthday: guide.birthday,
    guideType: guide.guideType
  };
};
