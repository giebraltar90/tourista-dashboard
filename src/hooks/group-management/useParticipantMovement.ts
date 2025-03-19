
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
    if (!selectedParticipant) return;
    
    const { participant, fromGroupIndex } = selectedParticipant;
    
    const updatedGroups = moveParticipant(
      fromGroupIndex,
      toGroupIndex,
      participant,
      currentGroups
    );
    
    if (!updatedGroups) return;
    
    // Update local state immediately for a responsive UI
    setLocalTourGroups(updatedGroups);
    
    // Then attempt to update on the server
    updateTourGroupsMutation.mutate(updatedGroups, {
      onError: (error) => {
        // If the API call fails, we don't revert the UI
        // but we show an error toast
        console.error("API Error:", error);
        toast.error("Changes saved locally only. Server update failed.");
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
