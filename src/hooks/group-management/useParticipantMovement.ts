
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useUpdateTourGroups } from "../useTourData";
import { toast } from "sonner";
import { moveParticipant } from "./services/participantService";

export const useParticipantMovement = (tourId: string, initialGroups: VentrataTourGroup[]) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const updateTourGroupsMutation = useUpdateTourGroups(tourId);
  
  const handleMoveParticipant = (
    toGroupIndex: number, 
    currentGroups: VentrataTourGroup[],
    setLocalTourGroups: (groups: VentrataTourGroup[]) => void
  ) => {
    if (!selectedParticipant) {
      console.error("Cannot move participant: No participant selected");
      return;
    }

    if (!currentGroups || currentGroups.length === 0) {
      console.error("Cannot move participant: No tour groups available");
      toast.error("Cannot move participant: No tour groups available");
      return;
    }
    
    const { participant, fromGroupIndex } = selectedParticipant;
    
    // Check if the destination group exists
    if (toGroupIndex < 0 || toGroupIndex >= currentGroups.length) {
      console.error(`Invalid destination group index: ${toGroupIndex}`);
      toast.error("Cannot move participant: Invalid destination group");
      return;
    }

    // Check if the source group exists
    if (fromGroupIndex < 0 || fromGroupIndex >= currentGroups.length) {
      console.error(`Invalid source group index: ${fromGroupIndex}`);
      toast.error("Cannot move participant: Invalid source group");
      return;
    }
    
    const updatedGroups = moveParticipant(
      fromGroupIndex,
      toGroupIndex,
      participant,
      currentGroups
    );
    
    if (!updatedGroups) {
      console.error("Failed to move participant");
      return;
    }
    
    // Update local state immediately for a responsive UI
    setLocalTourGroups(updatedGroups);
    
    // Then attempt to update on the server
    updateTourGroupsMutation.mutate(updatedGroups, {
      onError: (error) => {
        // If the API call fails, we don't revert the UI
        // but we show an error toast
        console.error("API Error:", error);
        toast.error("Changes saved locally only. Server update failed.");
      },
      onSuccess: () => {
        toast.success(`Moved ${participant.name} to ${updatedGroups[toGroupIndex].name || `Group ${toGroupIndex + 1}`}`);
      }
    });
    
    setSelectedParticipant(null);
  };
  
  return {
    selectedParticipant,
    setSelectedParticipant,
    handleMoveParticipant,
    moveParticipant,
    isMovePending: updateTourGroupsMutation.isPending
  };
};
