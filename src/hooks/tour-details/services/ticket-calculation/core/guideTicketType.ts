
import { GuideInfo } from "@/types/ventrata";

/**
 * Determine what ticket type a guide needs based on their guide type
 */
export const determineTicketTypeForGuide = (guideInfo: GuideInfo | null): "adult" | "child" | null => {
  if (!guideInfo) return null;
  
  // Convert to lowercase for consistent matching
  const guideType = guideInfo.guideType?.toLowerCase() || "";
  
  if (guideType.includes("junior") || guideType.includes("trainee")) {
    return "child";
  } else if (
    guideType.includes("senior") || 
    guideType.includes("standard") || 
    guideType.includes("lead")
  ) {
    return "adult";
  }
  
  // Default to adult ticket for any other guide type
  return "adult";
};

/**
 * Check if a guide type needs a ticket
 */
export const guideTypeNeedsTicket = (guideInfo: GuideInfo | null): boolean => {
  if (!guideInfo) return false;
  
  // Convert to lowercase for consistent matching
  const guideType = guideInfo.guideType?.toLowerCase() || "";
  
  // Special types that don't need tickets
  if (
    guideType.includes("volunteer") || 
    guideType.includes("observer") || 
    guideType.includes("no ticket")
  ) {
    return false;
  }
  
  // By default, guides need tickets
  return true;
};
