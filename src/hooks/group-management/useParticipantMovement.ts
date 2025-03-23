
import { useCallback, useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { moveParticipant } from "./services/participantService/movementService";
import { useUpdateTourGroups } from "@/hooks/tourData/useUpdateTourGroups";
import { useQueryClient } from "@tanstack/react-query";
import { recalculateAllTourGroupSizes } from "./services/participantService/recalculationService";
import { logger } from "@/utils/logger";

export const useParticipantMovement = (
  tourId: string, 
  tourGroups: VentrataTourGroup[]
) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  const [isMovePending, setIsMovePending] = useState(false);
  const { mutate: updateTourGroups } = useUpdateTourGroups(tourId);
  const queryClient = useQueryClient();

  // Handle moving a participant to another group
  const handleMoveParticipant = useCallback(async (toGroupIndex: number) => {
    if (!selectedParticipant || !tourGroups || toGroupIndex < 0 || toGroupIndex >= tourGroups.length) {
      logger.error("👤 [MOVE_PARTICIPANT] Invalid move attempt - missing data or invalid group index");
      return;
    }
    
    setIsMovePending(true);
    
    try {
      // Extract needed data
      const { participant, fromGroupIndex } = selectedParticipant;
      const fromGroup = tourGroups[fromGroupIndex];
      const toGroup = tourGroups[toGroupIndex];
      
      // Skip if trying to move to the same group
      if (fromGroupIndex === toGroupIndex) {
        toast.info("Participant is already in this group");
        setSelectedParticipant(null);
        setIsMovePending(false);
        return;
      }
      
      logger.debug(`👤 [MOVE_PARTICIPANT] Starting move for ${participant.name || participant.id}`, {
        fromGroup: fromGroup.name,
        toGroup: toGroup.name,
        participantId: participant.id,
        fromGroupId: fromGroup.id,
        toGroupId: toGroup.id,
        participantCount: participant.count || 1,
        participantChildCount: participant.childCount || 0
      });
      
      // First get a deep copy for optimistic updates
      // This is critical to avoid mutating the original state
      const updatedGroups = JSON.parse(JSON.stringify(tourGroups));
      
      // Immediately apply optimistic updates to UI for a smooth experience
      // Remove from the source group
      if (Array.isArray(updatedGroups[fromGroupIndex].participants)) {
        const initialLength = updatedGroups[fromGroupIndex].participants.length;
        updatedGroups[fromGroupIndex].participants = 
          updatedGroups[fromGroupIndex].participants.filter((p: any) => p.id !== participant.id);
        
        logger.debug(`👤 [MOVE_PARTICIPANT] Optimistic UI update - removed participant from source group. Before: ${initialLength}, After: ${updatedGroups[fromGroupIndex].participants.length}`);
      }
      
      // Then add to the destination group
      if (!Array.isArray(updatedGroups[toGroupIndex].participants)) {
        updatedGroups[toGroupIndex].participants = [];
        logger.debug(`👤 [MOVE_PARTICIPANT] Optimistic UI update - created participants array for destination group`);
      }
      
      // Update the participant's group_id to the new group
      const updatedParticipant = {...participant, group_id: toGroup.id};
      updatedGroups[toGroupIndex].participants.push(updatedParticipant);
      
      logger.debug(`👤 [MOVE_PARTICIPANT] Optimistic UI update - added participant to destination group. New length: ${updatedGroups[toGroupIndex].participants.length}`);
      
      // Recalculate all group sizes for UI consistency
      const recalculatedGroups = recalculateAllTourGroupSizes(updatedGroups);
      
      // Cancel any in-flight queries to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      // Apply optimistic update to the query cache
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        
        // Deep clone the tour data
        const newData = JSON.parse(JSON.stringify(oldData));
        
        // Update tourGroups with our recalculated values
        newData.tourGroups = recalculatedGroups;
        
        return newData;
      });
      
      logger.debug(`👤 [MOVE_PARTICIPANT] Applied optimistic update to query cache`);
      
      // Now actually update the database - IMPORTANT: Do this AFTER UI updates
      // This guarantees a responsive UI even if the database operation takes time
      const dbUpdateSuccess = await moveParticipant(participant.id, fromGroup.id, toGroup.id);
      
      if (!dbUpdateSuccess) {
        toast.error("Failed to update participant's group in the database");
        logger.error(`👤 [MOVE_PARTICIPANT] Database update failed for participant ${participant.id}`);
        
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        setIsMovePending(false);
        setSelectedParticipant(null);
        return;
      }
      
      logger.debug(`👤 [MOVE_PARTICIPANT] Database update completed successfully`);
      
      // Add delay to ensure UI reflects changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Persistent state update via the API
      // This ensures that if the direct database update didn't persist correctly,
      // we have a fallback that will update the state through the API
      updateTourGroups(recalculatedGroups, {
        onSuccess: () => {
          toast.success(`Moved ${participant.name || 'Participant'} to ${toGroup.name || `Group ${toGroupIndex + 1}`}`);
          logger.debug(`👤 [MOVE_PARTICIPANT] Successfully persisted group changes through API`);
          
          // Force a data refresh after all operations are complete
          setTimeout(() => {
            logger.debug(`👤 [MOVE_PARTICIPANT] Triggering final data refresh`);
            queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
          }, 2000);
        },
        onError: (error: any) => {
          logger.error("👤 [MOVE_PARTICIPANT] Error updating tour groups through API:", error);
          // Only show error if we haven't already shown one
          if (dbUpdateSuccess) {
            toast.error("Failed to save all group changes");
          }
          
          // Revert optimistic update on error
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        },
        onSettled: () => {
          // Always reset pending state when done
          setIsMovePending(false);
          setSelectedParticipant(null);
        }
      });
    } catch (error) {
      logger.error("👤 [MOVE_PARTICIPANT] Error moving participant:", error);
      toast.error("Failed to move participant");
      
      // Reset state
      setIsMovePending(false);
      setSelectedParticipant(null);
      
      // Force a refresh to get consistent state
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    }
  }, [selectedParticipant, tourGroups, tourId, updateTourGroups, queryClient]);

  // Function to open the move dialog 
  const handleOpenMoveDialog = useCallback((data: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  }) => {
    logger.debug(`👤 [MOVE_PARTICIPANT] Opening move dialog for participant`, {
      name: data.participant.name,
      id: data.participant.id,
      fromGroup: tourGroups[data.fromGroupIndex]?.name || `Group ${data.fromGroupIndex + 1}`
    });
    setSelectedParticipant(data);
  }, [tourGroups]);

  // Function to close the move dialog
  const handleCloseMoveDialog = useCallback(() => {
    logger.debug(`👤 [MOVE_PARTICIPANT] Closing move dialog`);
    setSelectedParticipant(null);
  }, []);

  return {
    selectedParticipant,
    isMovePending,
    handleMoveParticipant,
    handleOpenMoveDialog,
    handleCloseMoveDialog,
  };
};
