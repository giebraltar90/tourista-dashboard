
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
  // Special monitoring for specific tour ID
  const isSpecialMonitoringTour = tour.id === '324598820';
  
  if (isSpecialMonitoringTour) {
    logger.debug(`🔍 [TOUR #324598820 MONITORING] Detailed tracking for guide tickets`, {
      tourId: tour.id,
      tourLocation: tour.location,
      tourName: tour.tourName || 'Unknown Tour',
      guide1: guide1Info?.name || 'None',
      guide1Type: guide1Info?.guideType || 'None',
      guide2: guide2Info?.name || 'None', 
      guide2Type: guide2Info?.guideType || 'None',
      guide3: guide3Info?.name || 'None',
      guide3Type: guide3Info?.guideType || 'None',
      tourGroups: tour.tourGroups?.length || 0
    });
  }
  
  // Check if location needs tickets (now always true)
  const location = tour.location || '';
  const locationNeedsGuideTickets = useMemo(() => {
    return locationRequiresGuideTickets(location);
  }, [location]);
  
  // Calculate guide tickets using the calculation service
  const { adultTickets, childTickets, guides } = useMemo(() => {
    if (isSpecialMonitoringTour) {
      logger.debug(`🔍 [TOUR #324598820 MONITORING] Starting ticket calculation`, {
        guide1Type: guide1Info?.guideType || 'none',
        guide2Type: guide2Info?.guideType || 'none',
        guide3Type: guide3Info?.guideType || 'none',
        locationNeedsTickets: locationNeedsGuideTickets
      });
    } else {
      logger.debug(`🎟️ [useGuideTicketRequirements] Calculating tickets for tour ${tour.id} at location "${location}"`, {
        guide1Type: guide1Info?.guideType || 'none',
        guide2Type: guide2Info?.guideType || 'none',
        guide3Type: guide3Info?.guideType || 'none',
        locationNeedsTickets: locationNeedsGuideTickets
      });
    }
    
    if (!locationNeedsGuideTickets) {
      logger.debug(`🎟️ [useGuideTicketRequirements] Location "${location}" doesn't need guide tickets, returning zero`);
      return { adultTickets: 0, childTickets: 0, guides: [] };
    }
    
    const result = calculateGuideTicketsNeeded(
      guide1Info,
      guide2Info,
      guide3Info,
      location,
      tour.tourGroups
    );
    
    if (isSpecialMonitoringTour) {
      logger.debug(`🔍 [TOUR #324598820 MONITORING] Calculation result:`, {
        adultTickets: result.adultTickets,
        childTickets: result.childTickets,
        totalTickets: result.adultTickets + result.childTickets,
        guidesWithTickets: result.guides.map(g => ({
          name: g.guideName,
          type: g.guideType,
          ticketType: g.ticketType
        })),
        calculationDetails: {
          guide1RequiresTicket: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'No Guide 1',
          guide2RequiresTicket: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'No Guide 2',
          guide3RequiresTicket: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'No Guide 3',
        }
      });
    }
    
    return result;
  }, [guide1Info, guide2Info, guide3Info, location, tour.tourGroups, tour.id, locationNeedsGuideTickets, isSpecialMonitoringTour]);
  
  // Log detailed information about the guide tickets
  useEffect(() => {
    // Only log detailed info for high priority tours and when there are guides
    const shouldLogDetailed = isSpecialMonitoringTour || guides.length > 0;
    
    if (shouldLogDetailed) {
      if (isSpecialMonitoringTour) {
        logger.debug(`🔍 [TOUR #324598820 MONITORING] Final guide ticket requirements:`, {
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
      } else {
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
      }
    }
  }, [
    tour.id, tour.location, locationNeedsGuideTickets,
    guide1Info, guide2Info, guide3Info,
    adultTickets, childTickets, guides, isSpecialMonitoringTour
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
