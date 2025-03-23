
import { useEffect, useMemo } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { logger } from '@/utils/logger';

interface UseGuideRequirementsResult {
  locationNeedsGuideTickets: boolean;
  hasAssignedGuides: boolean;
}

/**
 * Hook to determine if guides need tickets for a specific tour/location
 */
export const useGuideRequirements = (
  tour: TourCardProps | null,
  guide1Info?: GuideInfo | null,
  guide2Info?: GuideInfo | null,
  guide3Info?: GuideInfo | null
): UseGuideRequirementsResult => {
  const locationLower = ((tour?.location || '').toLowerCase().trim());
  
  // Check if the location requires guide tickets
  const locationNeedsGuideTickets = useMemo(() => {
    return locationLower.includes('versailles') || 
           locationLower.includes('montmartre') ||
           locationLower.includes('versaille'); // Common misspelling
  }, [locationLower]);
  
  // Check if any guides are actually assigned to groups
  const hasAssignedGuides = useMemo(() => {
    if (!tour?.tourGroups) return false;
    
    return tour.tourGroups.some(group => 
      group.guideId && group.guideId !== "unassigned"
    );
  }, [tour?.tourGroups]);
  
  // Log guide requirements info for debugging
  useEffect(() => {
    logger.debug(`🎟️ [useGuideRequirements] Tour ${tour?.id || 'unknown'} guide requirements:`, {
      location: tour?.location || 'unknown',
      locationNeedsGuideTickets,
      hasAssignedGuides,
      guide1: guide1Info?.name || 'none',
      guide2: guide2Info?.name || 'none',
      guide3: guide3Info?.name || 'none',
    });
  }, [tour?.id, tour?.location, locationNeedsGuideTickets, hasAssignedGuides, 
      guide1Info?.name, guide2Info?.name, guide3Info?.name]);
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides
  };
};
