
import { GuideInfo } from "@/types/ventrata";
import { calculateBasicGuideTickets } from "./basicCalculator";
import { locationRequiresGuideTickets } from "../locationUtils";
import { logger } from "@/utils/logger";

/**
 * Calculate complete ticket requirements for a tour including guide tickets
 */
export const calculateCompleteTicketRequirements = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = "",
  tourGroups: any[] = []
) => {
  // Calculate whether guides need tickets
  const locationNeedsGuideTickets = locationRequiresGuideTickets(location);
  
  // Determine if we have any assigned guides
  const hasAssignedGuides = guide1Info !== null || guide2Info !== null || guide3Info !== null;
  
  // Log the inputs
  logger.debug(`🎟️ [CompleteTicketRequirements] Starting calculation for ${location}:`, {
    locationNeedsGuideTickets,
    hasAssignedGuides,
    guide1: guide1Info?.name || 'none',
    guide2: guide2Info?.name || 'none',
    guide3: guide3Info?.name || 'none',
    tourGroupsCount: tourGroups.length
  });
  
  // Calculate guide tickets using the basic calculator
  const guideTickets = calculateBasicGuideTickets(
    guide1Info, 
    guide2Info,
    guide3Info,
    location
  );
  
  // Return full result
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides,
    guideTickets
  };
};

// Explicitly export as calculateCompleteGuideTicketRequirements for backward compatibility
export const calculateCompleteGuideTicketRequirements = calculateCompleteTicketRequirements;
