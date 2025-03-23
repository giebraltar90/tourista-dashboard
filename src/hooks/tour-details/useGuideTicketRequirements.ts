
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useEffect, useMemo } from "react";
import { logger } from "@/utils/logger";
import { 
  calculateGuideTicketsNeeded,
  calculateCompleteGuideTicketRequirements
} from "./services/ticket-calculation";
import { locationRequiresGuideTickets } from "./services/ticket-calculation/locationUtils";

/**
 * Hook to determine guide ticket requirements for a tour
 */
export const useGuideTicketRequirements = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  // Check if location needs tickets
  const location = tour.location || '';
  const locationNeedsGuideTickets = useMemo(() => {
    return locationRequiresGuideTickets(location);
  }, [location]);
  
  // Calculate guide tickets using the calculation service
  const { adultTickets, childTickets, guides } = useMemo(() => {
    logger.debug(`🎟️ [useGuideTicketRequirements] Calculating tickets for tour ${tour.id} at location "${location}"`, {
      guide1Type: guide1Info?.guideType || 'none',
      guide2Type: guide2Info?.guideType || 'none',
      guide3Type: guide3Info?.guideType || 'none',
      locationNeedsTickets: locationNeedsGuideTickets
    });
    
    if (!locationNeedsGuideTickets) {
      logger.debug(`🎟️ [useGuideTicketRequirements] Location "${location}" doesn't need guide tickets, returning zero`);
      return { adultTickets: 0, childTickets: 0, guides: [] };
    }
    
    return calculateGuideTicketsNeeded(
      guide1Info,
      guide2Info,
      guide3Info,
      location,
      tour.tourGroups
    );
  }, [guide1Info, guide2Info, guide3Info, location, tour.tourGroups, tour.id, locationNeedsGuideTickets]);
  
  // Log detailed information about the guide tickets
  useEffect(() => {
    logger.debug(`🎟️ [useGuideTicketRequirements] Final guide ticket requirements for tour ${tour.id}:`, {
      tourLocation: tour.location,
      locationNeedsGuideTickets,
      guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'none',
      guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'none',
      guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'none',
      guideAdultTickets: adultTickets,
      guideChildTickets: childTickets,
      totalGuideTickets: adultTickets + childTickets,
      guidesWithTickets: guides.map(g => ({
        name: g.guideName,
        type: g.guideType,
        ticketType: g.ticketType
      }))
    });
  }, [
    tour.id, tour.location, locationNeedsGuideTickets, 
    guide1Info, guide2Info, guide3Info,
    adultTickets, childTickets, guides
  ]);
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides: guides.length > 0,
    guideTickets: {
      adultTickets,
      childTickets,
      guides: guides
    }
  };
};
