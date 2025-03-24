
import { useState, useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { moveParticipant } from "./services/participantService/movementService";
import { toast } from "sonner";
import { EventEmitter } from "@/utils/eventEmitter";

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
      
      console.log("PARTICIPANTS DEBUG: Moving participant:", {
        participantId: participant.id,
        fromGroup: sourceGroup.id,
        toGroup: targetGroup.id,
        fromIndex: fromGroupIndex,
        toIndex: toGroupIndex
      });
      
      // Move the participant using the service
      const success = await moveParticipant(participant.id, sourceGroup.id, targetGroup.id);
      
      if (success) {
        toast.success(`Moved participant to Group ${toGroupIndex + 1}`, {
          description: "All changes have been saved"
        });
        
        // Clear the selected participant
        setSelectedParticipant(null);
        
        // Notify of participant change to trigger ticket recalculation
        EventEmitter.emit(`participant-change:${tourId}`);
        
        return true;
      } else {
        toast.error("Failed to move participant. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("PARTICIPANTS DEBUG: Error moving participant:", error);
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
