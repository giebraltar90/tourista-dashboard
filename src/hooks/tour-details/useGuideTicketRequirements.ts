
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useEffect, useMemo } from "react";
import { logger } from "@/utils/logger";
import { 
  calculateGuideTicketsNeeded,
  calculateCompleteGuideTicketRequirements
} from "./services/ticket-calculation";

/**
 * Hook to determine guide ticket requirements for a tour
 */
export const useGuideTicketRequirements = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  // We always consider guide tickets (no longer location dependent)
  const locationNeedsGuideTickets = true;
  
  // Calculate guide tickets using the new calculation service
  const { adultTickets, childTickets, guides } = useMemo(() => {
    return calculateGuideTicketsNeeded(
      guide1Info,
      guide2Info,
      guide3Info,
      tour.location,
      tour.tourGroups
    );
  }, [guide1Info, guide2Info, guide3Info, tour.location, tour.tourGroups]);
  
  // Log detailed information about the guide tickets
  useEffect(() => {
    logger.debug(`🎟️ [useGuideTicketRequirements] Guide ticket requirements for tour ${tour.id}:`, {
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
