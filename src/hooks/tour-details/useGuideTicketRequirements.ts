
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useEffect, useMemo } from "react";
import { logger } from "@/utils/logger";
import { 
  calculateGuideTicketsNeeded,
  calculateCompleteGuideTicketRequirements
} from "./services/ticket-calculation";
import { locationRequiresGuideTickets } from "./services/ticket-calculation/locationUtils";
import { EventEmitter } from "@/utils/eventEmitter";

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
  const currentTourId = tour.id;
  
  // ENHANCED LOGGING: Log initial tour data for intensive monitoring
  useEffect(() => {
    if (isSpecialMonitoringTour) {
      logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Tour data received:`, {
        tourId: tour.id,
        tourLocation: tour.location,
        tourName: tour.tourName || 'Unknown Tour',
        tourDate: tour.date,
        referenceCode: tour.referenceCode,
        guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'None',
        guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'None', 
        guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'None',
        tourGroups: tour.tourGroups ? JSON.stringify(tour.tourGroups) : 'No groups'
      });
    }
    
    // Always log guide info for any tour
    logger.debug(`🎟️ [useGuideTicketRequirements] Tour ${tour.id} guide data:`, {
      guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'None',
      guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'None',
      guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'None',
    });
  }, [isSpecialMonitoringTour, tour, guide1Info, guide2Info, guide3Info]);
  
  // Check if location needs tickets (now always true)
  const location = tour.location || '';
  const locationNeedsGuideTickets = useMemo(() => {
    const result = locationRequiresGuideTickets(location);
    logger.debug(`🎟️ [useGuideTicketRequirements] Location "${location}" needs guide tickets: ${result}`);
    return result;
  }, [location]);
  
  // Calculate guide tickets using the calculation service
  const { adultTickets, childTickets, guides } = useMemo(() => {
    // Log inputs for debugging
    logger.debug(`🎟️ [useGuideTicketRequirements] Calculating tickets for tour ${tour.id} with guides:`, {
      guide1: guide1Info?.name || 'None',
      guide2: guide2Info?.name || 'None',
      guide3: guide3Info?.name || 'None',
      guideCount: [guide1Info, guide2Info, guide3Info].filter(Boolean).length
    });
    
    if (!locationNeedsGuideTickets) {
      logger.debug(`🎟️ [useGuideTicketRequirements] Location doesn't need guide tickets, returning zero`);
      return { adultTickets: 0, childTickets: 0, guides: [] };
    }
    
    const result = calculateGuideTicketsNeeded(
      guide1Info,
      guide2Info,
      guide3Info,
      location,
      tour.tourGroups
    );
    
    // Log final calculation results
    logger.debug(`🎟️ [useGuideTicketRequirements] Final guide ticket calculation:`, {
      adultTickets: result.adultTickets,
      childTickets: result.childTickets,
      totalGuideTickets: result.adultTickets + result.childTickets,
      guidesWithTickets: result.guides.length,
      guides: result.guides.map(g => ({
        name: g.guideName,
        type: g.guideType,
        ticket: g.ticketType
      }))
    });
    
    return result;
  }, [guide1Info, guide2Info, guide3Info, location, tour.tourGroups, tour.id, locationNeedsGuideTickets]);
  
  // Emit a guide-tickets-calculated event when the tickets change
  useEffect(() => {
    // This will notify other components that the guide tickets have been calculated
    EventEmitter.emit(`guide-tickets-calculated:${tour.id}`, {
      adultTickets,
      childTickets,
      guides
    });
  }, [tour.id, adultTickets, childTickets, guides]);
  
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
