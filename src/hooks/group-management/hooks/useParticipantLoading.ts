
import { useCallback } from 'react';
import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for loading participant data
 */
export const useParticipantLoading = (tourId?: string) => {
  // Handle loading participants 
  const loadParticipants = useCallback(async (groupIds: string | string[]) => {
    try {
      // Convert single ID to array if needed
      const groupIdArray = typeof groupIds === 'string' ? [groupIds] : groupIds;
      
      logger.debug("🔍 [GROUP_MANAGEMENT] Loading participants for groups:", groupIdArray);
      
      // Here we're directly implementing the loading logic instead of using a service
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIdArray);
        
      if (error) {
        logger.error("🔍 [GROUP_MANAGEMENT] Error loading participants:", error);
        return { success: false, error: error.message };
      }
      
      // Get the groups data too
      const { data: groups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('*')
        .in('id', groupIdArray);
        
      if (groupsError) {
        logger.error("🔍 [GROUP_MANAGEMENT] Error loading groups:", groupsError);
        return { success: false, error: groupsError.message };
      }
      
      // Invalidate cache for this tour if we have a tourId
      if (tourId) {
        logger.debug("🔍 [GROUP_MANAGEMENT] Invalidating cache for tour:", tourId);
      }
      
      return { success: true, participants, groups };
    } catch (error) {
      logger.error("🔍 [GROUP_MANAGEMENT] Exception loading participants:", error);
      return { success: false, error: 'Exception loading participants' };
    }
  }, [tourId]);

  return { loadParticipants };
};
