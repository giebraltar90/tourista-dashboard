
import { useMemo } from "react";
import { calculateCompleteTicketRequirements } from "./services/ticket-calculation/core/completeCalculator";
import { logger } from "@/utils/logger";

/**
 * Hook to calculate guide ticket requirements in a consistent, reusable way
 */
export const useGuideTicketRequirements = (
  tour: any,
  guide1Info: any,
  guide2Info: any,
  guide3Info: any
) => {
  // Use the centralized calculation service
  const result = useMemo(() => {
    logger.debug(`🎟️ [useGuideTicketRequirements] Calculating requirements for tour:`, {
      location: tour?.location || "",
      guide1: guide1Info?.name || "none",
      guide2: guide2Info?.name || "none",
      guide3: guide3Info?.name || "none",
    });
    
    return calculateCompleteTicketRequirements(
      guide1Info, 
      guide2Info,
      guide3Info,
      tour?.location || "",
      tour?.tourGroups || []
    );
  }, [tour, guide1Info, guide2Info, guide3Info]);
  
  // Log the calculated requirements
  logger.debug(`🎟️ [useGuideTicketRequirements] Calculated ticket requirements:`, {
    locationNeedsGuideTickets: result.locationNeedsGuideTickets,
    hasAssignedGuides: result.hasAssignedGuides,
    adultTickets: result.guideTickets.adultTickets,
    childTickets: result.guideTickets.childTickets,
    totalTickets: result.guideTickets.adultTickets + result.guideTickets.childTickets,
    guides: result.guideTickets.guides.map(g => ({
      name: g.guideName,
      type: g.ticketType
    }))
  });
  
  return result;
};
