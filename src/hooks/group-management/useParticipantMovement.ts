
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useUpdateTourGroups } from "../useTourData";
import { toast } from "sonner";
import { moveParticipant, updateParticipantGroupInDatabase } from "./services/participantService";

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
    
    // Get source and destination group IDs for database update
    const sourceGroupId = currentGroups[fromGroupIndex].id;
    const destGroupId = currentGroups[toGroupIndex].id;
    
    if (!sourceGroupId || !destGroupId) {
      console.error("Missing group IDs for database update", { sourceGroupId, destGroupId });
      toast.error("Cannot update database: Missing group information");
      return;
    }
    
    // First, update the participant in the database
    updateParticipantGroupInDatabase(participant.id, destGroupId)
      .then(success => {
        if (success) {
          console.log(`Successfully updated participant ${participant.id} in database`);
          
          // Only show success message for database update
          toast.success(`Moved ${participant.name} to ${updatedGroups[toGroupIndex].name || `Group ${toGroupIndex + 1}`}`);
        } else {
          console.error(`Failed to update participant ${participant.id} in database`);
          toast.error("Failed to save changes in database. Try refreshing the page.");
        }
      })
      .catch(error => {
        console.error("Exception updating participant in database:", error);
        toast.error("Error saving changes to database");
      });
    
    // Then attempt to update the groups on the server
    // This uses the improved useUpdateTourGroups hook which won't invalidate queries immediately
    updateTourGroupsMutation.mutate(updatedGroups, {
      onError: (error) => {
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
