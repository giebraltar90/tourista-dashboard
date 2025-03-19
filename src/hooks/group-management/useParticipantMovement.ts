
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useUpdateTourGroups } from "../useTourData";
import { toast } from "sonner";

export const useParticipantMovement = (tourId: string, initialGroups: VentrataTourGroup[]) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const updateTourGroupsMutation = useUpdateTourGroups(tourId);
  
  const moveParticipant = (
    fromGroupIndex: number,
    toGroupIndex: number,
    participant: VentrataParticipant,
    currentGroups: VentrataTourGroup[]
  ) => {
    if (fromGroupIndex === toGroupIndex) {
      toast.error("Participant is already in this group");
      return null;
    }
    
    // Create a deep copy of the current tour groups
    const updatedTourGroups = JSON.parse(JSON.stringify(currentGroups));
    
    const sourceGroup = updatedTourGroups[fromGroupIndex];
    if (sourceGroup.participants) {
      // Remove participant from source group
      sourceGroup.participants = sourceGroup.participants.filter(
        (p: VentrataParticipant) => p.id !== participant.id
      );
      
      // Update source group's size property based on actual participant count
      sourceGroup.size = sourceGroup.participants.reduce(
        (total: number, p: VentrataParticipant) => total + (p.count || 1),
        0
      );
      
      // Update child count if needed
      if (participant.childCount) {
        sourceGroup.childCount = Math.max(0, (sourceGroup.childCount || 0) - participant.childCount);
      }
    }
    
    const destGroup = updatedTourGroups[toGroupIndex];
    if (!destGroup.participants) {
      destGroup.participants = [];
    }
    
    // Add participant to destination group
    destGroup.participants.push(participant);
    
    // Update destination group's size property based on actual participant count
    destGroup.size = destGroup.participants.reduce(
      (total: number, p: VentrataParticipant) => total + (p.count || 1),
      0
    );
    
    // Update child count if needed
    if (participant.childCount) {
      destGroup.childCount = (destGroup.childCount || 0) + participant.childCount;
    }
    
    return updatedTourGroups;
  };
  
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
