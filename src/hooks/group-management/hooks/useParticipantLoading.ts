
import { useCallback } from 'react';
import { logger } from '@/utils/logger';
import { useParticipantService } from '../services/participantService';
import { queryCache } from '@/integrations/supabase/client';

/**
 * Hook for loading participant data
 */
export const useParticipantLoading = (tourId?: string) => {
  const { loadParticipants: loadParticipantsService } = useParticipantService();
  
  // Handle loading participants 
  const loadParticipants = useCallback(async (groupIds: string | string[]) => {
    try {
      // Convert single ID to array if needed
      const groupIdArray = typeof groupIds === 'string' ? [groupIds] : groupIds;
      
      logger.debug("🔍 [GROUP_MANAGEMENT] Loading participants for groups:", groupIdArray);
      
      const result = await loadParticipantsService(groupIdArray);
      
      // Invalidate cache for this tour if we have a tourId
      if (tourId) {
        const cacheKey = `localTourGroups_${tourId}`;
        queryCache.invalidate(cacheKey);
      }
      
      return result;
    } catch (error) {
      logger.error("🔍 [GROUP_MANAGEMENT] Exception loading participants:", error);
      return { success: false, error: 'Exception loading participants' };
    }
  }, [loadParticipantsService, tourId]);

  return { loadParticipants };
};
