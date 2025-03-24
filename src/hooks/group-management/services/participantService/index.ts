
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VentrataParticipant } from '@/types/ventrata';
import { logger } from '@/utils/logger';
import { syncTourGroupSizes } from './syncService';
import { updateParticipantCounts } from '@/services/api/participants/updateParticipantCountsRPC';
import { formatParticipantCount, calculateTotalParticipants, calculateTotalChildCount } from './countingService';

// Export functions directly to maintain backward compatibility
export { formatParticipantCount, calculateTotalParticipants, calculateTotalChildCount };

// Create a hook for participant service
export const useParticipantService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Load participants for groups
  const loadParticipants = useCallback(async (groupIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!groupIds.length) {
        logger.warn("No group IDs provided for loading participants");
        return { success: false, error: "No group IDs provided" };
      }
      
      logger.debug("Loading participants for groups:", groupIds);
      
      // First, get the tour groups
      const { data: groups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('id, name, size, child_count')
        .in('id', groupIds);
        
      if (groupsError) {
        logger.error("Error fetching tour groups:", groupsError);
        setError("Failed to fetch tour groups");
        return { success: false, error: groupsError.message };
      }
      
      // Then get participants for those groups
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (participantsError) {
        logger.error("Error fetching participants:", participantsError);
        setError("Failed to fetch participants");
        return { success: false, error: participantsError.message };
      }
      
      logger.debug(`Loaded ${groups.length} groups and ${participants.length} participants`);
      
      setLastRefreshed(new Date());
      return { success: true, groups, participants };
    } catch (err) {
      logger.error("Exception in loadParticipants:", err);
      setError("An unexpected error occurred while loading participants");
      return { success: false, error: String(err) };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Move a participant to a new group
  const moveParticipant = useCallback(async (
    participant: VentrataParticipant,
    fromGroupId: string,
    toGroupId: string
  ) => {
    try {
      if (!participant || !participant.id) {
        logger.error("Invalid participant object for move operation");
        return false;
      }
      
      logger.debug("Moving participant:", {
        id: participant.id,
        name: participant.name,
        fromGroupId,
        toGroupId
      });
      
      // Update the participant's group_id
      const { error: updateError } = await supabase
        .from('participants')
        .update({ group_id: toGroupId })
        .eq('id', participant.id);
        
      if (updateError) {
        logger.error("Error moving participant:", updateError);
        return false;
      }
      
      logger.debug("Participant moved successfully");
      
      // Force recalculation of group sizes after a brief delay
      setTimeout(async () => {
        try {
          // Use RPC to update all participant counts
          if (fromGroupId) {
            const tourResult = await supabase
              .from('tour_groups')
              .select('tour_id')
              .eq('id', fromGroupId)
              .single();
              
            if (tourResult.data?.tour_id) {
              await updateParticipantCounts(tourResult.data.tour_id);
            }
          }
        } catch (err) {
          logger.error("Error in post-move cleanup:", err);
        }
      }, 500);
      
      return true;
    } catch (err) {
      logger.error("Exception in moveParticipant:", err);
      return false;
    }
  }, []);
  
  // Refresh participants data
  const refreshParticipants = useCallback(async () => {
    try {
      setLastRefreshed(new Date());
      logger.debug("Refreshing participant data");
      
      // The actual refresh happens in the component that calls this
      return true;
    } catch (err) {
      logger.error("Error in refreshParticipants:", err);
      return false;
    }
  }, []);
  
  return {
    loadParticipants,
    moveParticipant,
    refreshParticipants,
    isLoading,
    error,
    lastRefreshed
  };
};
