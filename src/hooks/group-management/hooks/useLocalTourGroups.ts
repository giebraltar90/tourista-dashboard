
import { useState, useEffect } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { VentrataTourGroup } from '@/types/ventrata';
import { logger } from '@/utils/logger';
import { queryCache } from '@/integrations/supabase/client';

/**
 * Hook to manage local tour groups state
 */
export const useLocalTourGroups = (tour: TourCardProps | null | undefined) => {
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>([]);
  
  // Effect to initialize localTourGroups when tour changes
  useEffect(() => {
    if (tour?.tourGroups) {
      const cacheKey = `localTourGroups_${tour.id}`;
      const cachedGroups = queryCache.get(cacheKey);
      
      if (cachedGroups) {
        logger.debug("🔍 [GROUP_MANAGEMENT] Using cached tour groups");
        setLocalTourGroups(cachedGroups);
      } else {
        logger.debug("🔍 [GROUP_MANAGEMENT] Setting initial tour groups from tour prop");
        setLocalTourGroups(tour.tourGroups);
        
        // Cache the groups
        queryCache.set(cacheKey, tour.tourGroups);
      }
    }
  }, [tour?.id, tour?.tourGroups]);

  return {
    localTourGroups,
    setLocalTourGroups
  };
};
