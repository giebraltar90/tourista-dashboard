
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useEffect, useMemo } from "react";
import { logger } from "@/utils/logger";
import { 
  calculateGuideTicketsNeeded,
  calculateCompleteGuideTicketRequirements
} from "./services/ticket-calculation";
import { locationRequiresGuideTickets, shouldOverrideGuideTickets } from "./services/ticket-calculation/locationUtils";

/**
 * Hook to determine guide ticket requirements for a tour
 */
export const useGuideTicketRequirements = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  // Check if this is a special tour that should override ticket calculations
  const isOverrideTour = useMemo(() => {
    return shouldOverrideGuideTickets(tour.id);
  }, [tour.id]);
  
  // Check if location needs tickets
  const location = tour.location || '';
  const locationNeedsGuideTickets = useMemo(() => {
    if (isOverrideTour) {
      return false; // Force no guide tickets for override tours
    }
    return locationRequiresGuideTickets(location);
  }, [location, isOverrideTour]);
  
  // Calculate guide tickets using the calculation service
  const { adultTickets, childTickets, guides } = useMemo(() => {
    logger.debug(`🎟️ [useGuideTicketRequirements] Calculating tickets for tour ${tour.id} at location "${location}"`, {
      guide1Type: guide1Info?.guideType || 'none',
      guide2Type: guide2Info?.guideType || 'none',
      guide3Type: guide3Info?.guideType || 'none',
      locationNeedsTickets: locationNeedsGuideTickets,
      isOverrideTour
    });
    
    if (isOverrideTour) {
      logger.debug(`🎟️ [useGuideTicketRequirements] Tour ${tour.id} has a manual override, returning zero tickets`);
      return { adultTickets: 0, childTickets: 0, guides: [] };
    }
    
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
  }, [guide1Info, guide2Info, guide3Info, location, tour.tourGroups, tour.id, locationNeedsGuideTickets, isOverrideTour]);
  
  // Log detailed information about the guide tickets
  useEffect(() => {
    logger.debug(`🎟️ [useGuideTicketRequirements] Final guide ticket requirements for tour ${tour.id}:`, {
      tourLocation: tour.location,
      isOverrideTour,
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
    tour.id, tour.location, locationNeedsGuideTickets, isOverrideTour,
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
