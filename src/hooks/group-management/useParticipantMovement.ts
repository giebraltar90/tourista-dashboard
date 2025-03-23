
import { useState, useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { moveParticipant } from "./services/participantService/movementService";
import { toast } from "sonner";
import { EventEmitter, EVENTS } from "@/utils/eventEmitter";
import { logger } from "@/utils/logger";

export const useParticipantMovement = (tourId: string, tourGroups: VentrataTourGroup[]) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const [isMovePending, setIsMovePending] = useState(false);
  
  const handleOpenMoveDialog = useCallback((data: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  }) => {
    setSelectedParticipant(data);
  }, []);
  
  const handleCloseMoveDialog = useCallback(() => {
    setSelectedParticipant(null);
  }, []);
  
  const handleMoveParticipant = useCallback(async (toGroupIndex: number) => {
    if (!selectedParticipant) return false;
    
    // Extract participant and source group index
    const { participant, fromGroupIndex } = selectedParticipant;
    
    // Get source and target group IDs
    const sourceGroup = tourGroups[fromGroupIndex];
    const targetGroup = tourGroups[toGroupIndex];
    
    if (!sourceGroup || !targetGroup) {
      toast.error("Group not found");
      return false;
    }
    
    try {
      setIsMovePending(true);
      
      logger.debug("PARTICIPANTS DEBUG: Moving participant:", {
        participantId: participant.id,
        fromGroup: sourceGroup.id,
        toGroup: targetGroup.id,
        fromIndex: fromGroupIndex,
        toIndex: toGroupIndex,
        participantName: participant.name,
        participantCount: participant.count
      });
      
      // Move the participant using the service
      const success = await moveParticipant(participant.id, sourceGroup.id, targetGroup.id);
      
      if (success) {
        toast.success(`Moved participant to Group ${toGroupIndex + 1}`, {
          description: "All changes have been saved"
        });
        
        // Clear the selected participant
        setSelectedParticipant(null);
        
        // Emit multiple events to ensure all components update
        
        // 1. Notify of participant change to trigger ticket recalculation
        EventEmitter.emit(EVENTS.PARTICIPANT_CHANGED(tourId), {
          moved: true,
          participantId: participant.id,
          fromGroupId: sourceGroup.id,
          toGroupId: targetGroup.id
        });
        logger.debug(`Emitted ${EVENTS.PARTICIPANT_CHANGED(tourId)} event`);
        
        // 2. Explicitly trigger ticket recalculation
        EventEmitter.emit(EVENTS.RECALCULATE_TICKETS(tourId), {
          source: 'participant_movement',
          participantId: participant.id,
          fromGroupId: sourceGroup.id,
          toGroupId: targetGroup.id
        });
        
        // 3. Request a refresh of participant data
        EventEmitter.emit(EVENTS.REFRESH_PARTICIPANTS, { tourId });
        
        return true;
      } else {
        toast.error("Failed to move participant. Please try again.");
        return false;
      }
    } catch (error) {
      logger.error("PARTICIPANTS DEBUG: Error moving participant:", error);
      toast.error("An error occurred while moving the participant");
      return false;
    } finally {
      setIsMovePending(false);
    }
  }, [selectedParticipant, tourGroups, tourId]);
  
  return {
    selectedParticipant,
    setSelectedParticipant: handleOpenMoveDialog,
    handleOpenMoveDialog,
    handleCloseMoveDialog,
    handleMoveParticipant,
    isMovePending
  };
};
