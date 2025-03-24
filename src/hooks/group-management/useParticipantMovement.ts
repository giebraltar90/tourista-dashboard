
import { useState, useCallback } from 'react';
import { VentrataParticipant, VentrataTourGroup } from '@/types/ventrata';
import { moveParticipant as moveParticipantService } from './services/participantService/movementService';
import { syncParticipantCounts } from '@/services/api/participants/syncService';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { EventEmitter } from '@/utils/eventEmitter';

/**
 * Hook to manage participant movement between groups
 */
export const useParticipantMovement = (tourId?: string, onSuccess?: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const moveParticipant = useCallback(async (
    participant: VentrataParticipant,
    fromGroupId: string,
    toGroupId: string,
    localTourGroups: VentrataTourGroup[],
    setLocalTourGroups: (groups: VentrataTourGroup[] | ((prev: VentrataTourGroup[]) => VentrataTourGroup[])) => void,
    fromGroupIndex: number,
    toGroupIndex: number,
  ) => {
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
      logger.debug("🔄 [PARTICIPANT_MOVEMENT] Moving participant", {
        participantId: participant.id,
        fromGroupId,
        toGroupId
      });
      
      // First update UI optimistically
      setLocalTourGroups((prev: VentrataTourGroup[]) => {
        const updatedGroups = [...prev];
        
        // Clone and remove participant from source group
        if (updatedGroups[fromGroupIndex] && updatedGroups[fromGroupIndex].participants) {
          const sourceParticipants = [...updatedGroups[fromGroupIndex].participants];
          const participantIndex = sourceParticipants.findIndex(p => p.id === participant.id);
          
          if (participantIndex !== -1) {
            sourceParticipants.splice(participantIndex, 1);
            updatedGroups[fromGroupIndex] = {
              ...updatedGroups[fromGroupIndex],
              participants: sourceParticipants
            };
          }
        }
        
        // Clone and add participant to target group
        if (updatedGroups[toGroupIndex] && updatedGroups[toGroupIndex].participants) {
          const targetParticipants = [...updatedGroups[toGroupIndex].participants];
          const updatedParticipant = { ...participant, groupId: toGroupId, group_id: toGroupId };
          targetParticipants.push(updatedParticipant);
          
          updatedGroups[toGroupIndex] = {
            ...updatedGroups[toGroupIndex],
            participants: targetParticipants
          };
        }
        
        return updatedGroups;
      });
      
      // Use our simplified movement service - now handling all operations in a single database function
      const success = await moveParticipantService(
        participant.id,
        fromGroupId,
        toGroupId
      );
      
      if (success) {
        logger.debug("🔄 [PARTICIPANT_MOVEMENT] Participant moved successfully");
        
        // Notify of participant change
        if (tourId) {
          EventEmitter.emit(`participant-change:${tourId}`);
        }
        
        // Call success callback if provided
        if (onSuccess) onSuccess();
        
        return true;
      } else {
        logger.error("🔄 [PARTICIPANT_MOVEMENT] Failed to update participant group");
        toast.error("Failed to move participant. Database update failed.");
        
        // Revert optimistic update
        setLocalTourGroups(localTourGroups);
        return false;
      }
    } catch (error) {
      logger.error("🔄 [PARTICIPANT_MOVEMENT] Error while moving participant:", error);
      toast.error("An error occurred while moving the participant");
      
      // Revert optimistic update
      setLocalTourGroups(localTourGroups);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onSuccess, tourId]);
  
  return {
    moveParticipant,
    isProcessing
  };
};
