
import { useGuideData } from "./useGuideData";
import { GuideInfo } from "@/types/ventrata";

/**
 * Returns information about a guide based on the guide name
 * Improved with better error handling and fallbacks
 */
export const useGuideInfo = (guideName: string): GuideInfo | null => {
  // Safely access the guides data with proper error handling
  const guideDataResult = useGuideData();
  
  // Early return if no guide name provided
  if (!guideName) {
    return null;
  }
  
  const guides = guideDataResult?.guides || [];
  
  // Find the guide by name
  const guide = guides.find(g => g?.name === guideName);
  
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
    birthday: guide.birthday || new Date(),
    guideType: guide.guideType || "GA Ticket"
  };
};
