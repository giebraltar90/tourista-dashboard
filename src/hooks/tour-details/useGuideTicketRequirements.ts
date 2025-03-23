
import { useMemo } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { locationRequiresGuideTickets, calculateGuideTicketsNeeded } from '@/hooks/tour-details/services/ticketCalculationService';
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
    return locationRequiresGuideTickets(location);
  }, [tour?.location]);
  
  // Check if any guides are actually assigned to groups
  const hasAssignedGuides = useMemo(() => {
    if (!tour?.tourGroups) return false;
    
    return tour.tourGroups.some(group => 
      group.guideId && group.guideId !== "unassigned"
    );
  }, [tour?.tourGroups]);
  
  // Calculate guide tickets
  const guideTickets = useMemo(() => {
    if (!locationNeedsGuideTickets || !hasAssignedGuides || !tour) {
      return {
        adultTickets: 0,
        childTickets: 0,
        guides: []
      };
    }
    
    return calculateGuideTicketsNeeded(
      guide1Info || null,
      guide2Info || null,
      guide3Info || null,
      tour.location,
      tour.tourGroups
    );
  }, [
    locationNeedsGuideTickets, 
    hasAssignedGuides, 
    tour, 
    guide1Info, 
    guide2Info, 
    guide3Info
  ]);
  
  // Log ticket requirements for debugging
  useMemo(() => {
    logger.debug(`🎟️ [useGuideTicketRequirements] Tour ${tour?.id || 'unknown'} guide tickets:`, {
      location: tour?.location || 'unknown',
      locationNeedsGuideTickets,
      hasAssignedGuides,
      adultTickets: guideTickets.adultTickets,
      childTickets: guideTickets.childTickets,
      guidesWithTickets: guideTickets.guides.length
    });
  }, [tour?.id, tour?.location, locationNeedsGuideTickets, hasAssignedGuides, guideTickets]);
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides,
    guideTickets
  };
};
