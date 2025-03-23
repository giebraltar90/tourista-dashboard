
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
  
  // Log guide info for debugging
  useMemo(() => {
    logger.debug('🔍 [useGuideTicketRequirements] Available guide info:', {
      guide1: guide1Info ? { 
        id: guide1Info.id,
        name: guide1Info.name, 
        type: guide1Info.guideType 
      } : 'null',
      guide2: guide2Info ? { 
        id: guide2Info.id,
        name: guide2Info.name, 
        type: guide2Info.guideType 
      } : 'null',
      guide3: guide3Info ? { 
        id: guide3Info.id,
        name: guide3Info.name, 
        type: guide3Info.guideType 
      } : 'null',
    });
  }, [guide1Info, guide2Info, guide3Info]);
  
  // Check if any guides are actually assigned to groups
  const hasAssignedGuides = useMemo(() => {
    if (!tour?.tourGroups) return false;
    
    const guidesAssigned = tour.tourGroups.filter(group => 
      group.guideId && group.guideId !== "unassigned"
    );
    
    logger.debug(`🔍 [useGuideTicketRequirements] Groups with assigned guides:`, 
      guidesAssigned.map(g => ({
        groupId: g.id,
        groupName: g.name,
        guideId: g.guideId,
      }))
    );
    
    return guidesAssigned.length > 0;
  }, [tour?.tourGroups]);
  
  // Calculate guide tickets
  const guideTickets = useMemo(() => {
    if (!locationNeedsGuideTickets || !hasAssignedGuides || !tour) {
      logger.debug(`🔍 [useGuideTicketRequirements] Skipping ticket calculation:`, {
        locationNeedsGuideTickets,
        hasAssignedGuides,
        hasTour: !!tour
      });
      
      return {
        adultTickets: 0,
        childTickets: 0,
        guides: []
      };
    }
    
    logger.debug(`🔍 [useGuideTicketRequirements] Starting guide ticket calculation for tour ${tour.id}`, {
      tourGroups: tour.tourGroups?.map(g => ({
        id: g.id,
        name: g.name,
        guideId: g.guideId
      }))
    });
    
    // Explicitly find which guides are assigned to groups
    const assignedGuideIds = findAssignedGuides(
      tour.tourGroups || [],
      guide1Info,
      guide2Info,
      guide3Info
    );
    
    logger.debug(`🔍 [useGuideTicketRequirements] Found assigned guide IDs:`, {
      assignedGuideIds: Array.from(assignedGuideIds),
      guide1Id: guide1Info?.id || 'guide1',
      guide2Id: guide2Info?.id || 'guide2',
      guide3Id: guide3Info?.id || 'guide3'
    });
    
    const result = calculateGuideTicketsNeeded(
      guide1Info || null,
      guide2Info || null,
      guide3Info || null,
      tour.location,
      tour.tourGroups || []
    );
    
    logger.debug(`🔍 [useGuideTicketRequirements] Final guide ticket calculation result:`, {
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
      guidesWithTickets: guideTickets.guides.length,
      guidesDetails: guideTickets.guides.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType}`)
    });
  }, [tour?.id, tour?.location, locationNeedsGuideTickets, hasAssignedGuides, guideTickets]);
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides,
    guideTickets
  };
};
