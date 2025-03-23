
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
  
  // ENHANCED LOGGING: Log initial tour data for special monitoring tour
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
  }, [isSpecialMonitoringTour, tour, guide1Info, guide2Info, guide3Info]);
  
  // Check if location needs tickets (now always true)
  const location = tour.location || '';
  const locationNeedsGuideTickets = useMemo(() => {
    const result = locationRequiresGuideTickets(location);
    if (isSpecialMonitoringTour) {
      logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Location check:`, {
        location,
        locationNeedsGuideTickets: result,
        note: "Location check is now always TRUE per requirements"
      });
    }
    return result;
  }, [location, isSpecialMonitoringTour]);
  
  // Calculate guide tickets using the calculation service
  const { adultTickets, childTickets, guides } = useMemo(() => {
    if (isSpecialMonitoringTour) {
      logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Starting ticket calculation with:`, {
        guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'None',
        guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'None',
        guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'None',
        locationNeedsTickets: locationNeedsGuideTickets,
        tourGroups: tour.tourGroups ? `${tour.tourGroups.length} groups` : 'No groups'
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
      logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] FINAL TICKET CALCULATION:`, {
        adultTickets: result.adultTickets,
        childTickets: result.childTickets,
        totalTickets: result.adultTickets + result.childTickets,
        guidesWithTickets: result.guides.map(g => ({
          name: g.guideName,
          type: g.guideType,
          ticketType: g.ticketType
        })),
        calculationDetails: {
          guide1: guide1Info ? {
            name: guide1Info.name,
            type: guide1Info.guideType,
            needsTicket: result.guides.some(g => g.guideName === guide1Info.name && g.ticketType !== null)
          } : 'No Guide 1',
          guide2: guide2Info ? {
            name: guide2Info.name,
            type: guide2Info.guideType,
            needsTicket: result.guides.some(g => g.guideName === guide2Info.name && g.ticketType !== null)
          } : 'No Guide 2',
          guide3: guide3Info ? {
            name: guide3Info.name,
            type: guide3Info.guideType,
            needsTicket: result.guides.some(g => g.guideName === guide3Info.name && g.ticketType !== null)
          } : 'No Guide 3',
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
        logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] SUMMARY: Tour ${tour.id} requires:`, {
          adultGuideTickets: adultTickets,
          childGuideTickets: childTickets,
          totalGuideTickets: adultTickets + childTickets,
          hasAssignedGuides: guides.length > 0,
          guidesDetails: guides.map(g => ({
            name: g.guideName,
            type: g.guideType,
            ticketType: g.ticketType ? g.ticketType : 'No ticket needed'
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
