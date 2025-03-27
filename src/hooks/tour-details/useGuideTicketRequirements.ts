
import { useMemo } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { logger } from '@/utils/logger';

interface GuideTickets {
  adultTickets: number;
  childTickets: number;
  guides: {
    guideName: string;
    guideType: string;
    ticketType: 'adult' | 'child';
  }[];
}

/**
 * Hook to determine guide ticket requirements based on guide types and location
 */
export const useGuideTicketRequirements = (
  tour: TourCardProps | undefined | null,
  guide1Info: GuideInfo | null | undefined,
  guide2Info: GuideInfo | null | undefined,
  guide3Info: GuideInfo | null | undefined
) => {
  // Determine if the location requires guide tickets
  const locationNeedsGuideTickets = useMemo(() => {
    if (!tour) return false;
    
    const location = (tour.location || '').toLowerCase();
    const requiresTickets = [
      'louvre', 'versailles', 'palace', 'museum', 'gallery'
    ].some(keyword => location.includes(keyword));
    
    return requiresTickets;
  }, [tour]);
  
  // Check if there are any assigned guides
  const hasAssignedGuides = useMemo(() => {
    return !!(guide1Info || guide2Info || guide3Info);
  }, [guide1Info, guide2Info, guide3Info]);
  
  // Calculate guide tickets
  const guideTickets = useMemo<GuideTickets>(() => {
    if (!tour || !locationNeedsGuideTickets) {
      return { adultTickets: 0, childTickets: 0, guides: [] };
    }
    
    const guidesWithTickets: {
      guideName: string;
      guideType: string;
      ticketType: 'adult' | 'child';
    }[] = [];
    
    let adultTickets = 0;
    let childTickets = 0;
    
    // Process each guide
    const processGuide = (guide: GuideInfo | null | undefined) => {
      if (!guide) return;
      
      const guideType = (guide.guideType || '').toLowerCase();
      
      // Determine if the guide needs a ticket based on guide type
      const needsTicket = !['employee', 'staff', 'permanent'].includes(guideType);
      
      if (needsTicket) {
        // Determine ticket type (adult or child) based on guide type
        const isChildTicket = guideType.includes('child') || guideType.includes('junior');
        
        if (isChildTicket) {
          childTickets++;
          guidesWithTickets.push({
            guideName: guide.name || 'Unknown',
            guideType: guide.guideType || 'Unknown',
            ticketType: 'child'
          });
        } else {
          adultTickets++;
          guidesWithTickets.push({
            guideName: guide.name || 'Unknown',
            guideType: guide.guideType || 'Unknown',
            ticketType: 'adult'
          });
        }
      }
    };
    
    // Process each guide
    processGuide(guide1Info);
    processGuide(guide2Info);
    processGuide(guide3Info);
    
    // Return the calculated tickets
    return {
      adultTickets,
      childTickets,
      guides: guidesWithTickets
    };
  }, [tour, locationNeedsGuideTickets, guide1Info, guide2Info, guide3Info]);
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides,
    guideTickets
  };
};
