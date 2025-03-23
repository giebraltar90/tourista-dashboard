
import { useMemo } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { locationRequiresGuideTickets, findAssignedGuides, calculateGuideTicketsNeeded } from '@/hooks/tour-details/services/ticket-calculation';
import { logger } from '@/utils/logger';

export interface GuideTicketRequirementsResult {
  locationNeedsGuideTickets: boolean;
  hasAssignedGuides: boolean;
  guideTickets: {
    adultTickets: number;
    childTickets: number;
    guides: Array<{ guideName: string; guideType: string; ticketType: string | null }>
  };
}

/**
 * Hook to determine guide ticket requirements for a specific tour
 */
export const useGuideTicketRequirements = (
  tour: TourCardProps | null,
  guide1Info?: GuideInfo | null,
  guide2Info?: GuideInfo | null,
  guide3Info?: GuideInfo | null
): GuideTicketRequirementsResult => {
  // Check if the location requires guide tickets
  const locationNeedsGuideTickets = useMemo(() => {
    const location = tour?.location || '';
    const result = locationRequiresGuideTickets(location);
    logger.debug(`🔍 [useGuideTicketRequirements] Location "${location}" requires tickets: ${result}`);
    return result;
  }, [tour?.location]);
  
  // Log all guide information for debugging
  useMemo(() => {
    if (!tour) {
      logger.debug('🔍 [useGuideTicketRequirements] No tour data provided');
      return;
    }
    
    logger.debug('🔍 [useGuideTicketRequirements] Tour and guide info:', {
      tourId: tour.id,
      location: tour.location,
      tourRef: tour.referenceCode,
      date: tour.date.toISOString().split('T')[0],
      guide1Info: guide1Info ? {
        id: guide1Info.id,
        name: guide1Info.name,
        type: guide1Info.guideType
      } : 'none',
      guide2Info: guide2Info ? {
        id: guide2Info.id,
        name: guide2Info.name,
        type: guide2Info.guideType
      } : 'none',
      guide3Info: guide3Info ? {
        id: guide3Info.id,
        name: guide3Info.name,
        type: guide3Info.guideType
      } : 'none',
      groupCount: tour.tourGroups?.length || 0,
      tourGroups: Array.isArray(tour.tourGroups) ? 
        tour.tourGroups.map(g => ({
          id: g.id, 
          name: g.name,
          guideId: g.guideId,
          guideName: g.guideName
        })) : 'Invalid tourGroups'
    });
  }, [tour, guide1Info, guide2Info, guide3Info]);
  
  // Check if any guides are actually assigned to groups
  const hasAssignedGuides = useMemo(() => {
    if (!tour?.tourGroups) {
      logger.debug(`🔍 [useGuideTicketRequirements] No tour groups available`);
      return false;
    }
    
    // Check for valid tourGroups array
    if (!Array.isArray(tour.tourGroups)) {
      logger.debug(`🔍 [useGuideTicketRequirements] tourGroups is not an array`);
      return false;
    }
    
    // Filter to only groups with guides
    const guidesAssigned = tour.tourGroups.filter(group => 
      group.guideId && group.guideId !== "unassigned"
    );
    
    logger.debug(`🔍 [useGuideTicketRequirements] Found ${guidesAssigned.length} groups with assigned guides:`, 
      guidesAssigned.map(g => ({
        groupId: g.id,
        groupName: g.name,
        guideId: g.guideId,
        guideName: g.guideName
      }))
    );
    
    return guidesAssigned.length > 0;
  }, [tour?.tourGroups]);
  
  // Calculate guide tickets
  const guideTickets = useMemo(() => {
    if (!tour) {
      logger.debug(`🔍 [useGuideTicketRequirements] No tour data, skipping calculation`);
      return {
        adultTickets: 0,
        childTickets: 0,
        guides: []
      };
    }
    
    if (!locationNeedsGuideTickets) {
      logger.debug(`🔍 [useGuideTicketRequirements] Location doesn't require tickets, skipping calculation`);
      return {
        adultTickets: 0,
        childTickets: 0,
        guides: []
      };
    }
    
    if (!hasAssignedGuides) {
      logger.debug(`🔍 [useGuideTicketRequirements] No assigned guides, skipping calculation`);
      return {
        adultTickets: 0,
        childTickets: 0,
        guides: []
      };
    }
    
    logger.debug(`🔍 [useGuideTicketRequirements] Starting ticket calculation for tour ${tour.id} ref:${tour.referenceCode}`);
    
    // Calculate guide tickets needed
    const result = calculateGuideTicketsNeeded(
      guide1Info || null,
      guide2Info || null,
      guide3Info || null,
      tour.location,
      tour.tourGroups || []
    );
    
    logger.debug(`🔍 [useGuideTicketRequirements] Calculation results:`, {
      adultTickets: result.adultTickets,
      childTickets: result.childTickets,
      guides: result.guides.map(g => ({
        name: g.guideName,
        type: g.guideType,
        ticketType: g.ticketType
      }))
    });
    
    return result;
  }, [
    tour, 
    locationNeedsGuideTickets, 
    hasAssignedGuides, 
    guide1Info, 
    guide2Info, 
    guide3Info
  ]);
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides,
    guideTickets
  };
};
