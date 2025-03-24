
import { useCallback } from 'react';
import { VentrataParticipant, VentrataTourGroup } from '@/types/ventrata';
import { logger } from '@/utils/logger';
import { useParticipantService } from '../services/participantService';
import { queryCache } from '@/integrations/supabase/client';

/**
 * Hook for handling participant movement between groups
 */
export const useParticipantMovement = (
  tourId?: string,
  refreshCallback?: () => Promise<void>
) => {
  const { moveParticipant: moveParticipantService } = useParticipantService();
  
  // Handle moving a participant to a new group
  const moveParticipant = useCallback(async (
    participant: VentrataParticipant,
    fromGroupId: string,
    toGroupId: string,
    localTourGroups: VentrataTourGroup[],
    setLocalTourGroups: (groups: VentrataTourGroup[]) => void,
    fromGroupIndex: number,
    toGroupIndex: number
  ) => {
    try {      
      logger.debug("🔄 [GROUP_MANAGEMENT] Moving participant", {
        participantId: participant.id,
        fromGroupId,
        toGroupId
      });
      
      // Call the service to move the participant
      const success = await moveParticipantService(participant, fromGroupId, toGroupId);
      
      if (success) {
        logger.debug("🔄 [GROUP_MANAGEMENT] Participant moved successfully");
        
        // Optimistically update the UI, but also trigger a refresh to get accurate sizes
        setLocalTourGroups(prev => {
          const updatedGroups = [...prev];
          
          // Remove from source group
          if (updatedGroups[fromGroupIndex] && updatedGroups[fromGroupIndex].participants) {
            updatedGroups[fromGroupIndex] = {
              ...updatedGroups[fromGroupIndex],
              participants: updatedGroups[fromGroupIndex].participants!.filter(p => p.id !== participant.id)
            };
          }
          
          // Add to target group
          if (updatedGroups[toGroupIndex] && updatedGroups[toGroupIndex].participants) {
            updatedGroups[toGroupIndex] = {
              ...updatedGroups[toGroupIndex],
              participants: [...(updatedGroups[toGroupIndex].participants || []), { ...participant, group_id: toGroupId }]
            };
          }
          
          // Invalidate cache
          if (tourId) {
            const cacheKey = `localTourGroups_${tourId}`;
            queryCache.invalidate(cacheKey);
          }
          
          return updatedGroups;
        });
        
        // Get fresh data after a short delay
        if (refreshCallback) {
          setTimeout(() => {
            refreshCallback();
          }, 1000);
        }
        
        return true;
      } else {
        logger.error("🔄 [GROUP_MANAGEMENT] Failed to move participant");
        return false;
      }
      
    } catch (error) {
      logger.error("🔄 [GROUP_MANAGEMENT] Error moving participant:", error);
      return false;
    }
  }, [moveParticipantService, tourId, refreshCallback]);

  return { moveParticipant };
};
