
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useUpdateTourGroups } from "../tourData/useUpdateTourGroups";
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
    
    // Make a deep copy of the current groups to avoid reference issues
    const groupsToUpdate = JSON.parse(JSON.stringify(currentGroups));
    
    const updatedGroups = moveParticipant(
      fromGroupIndex,
      toGroupIndex,
      participant,
      groupsToUpdate
    );
    
    if (!updatedGroups) {
      console.error("Failed to move participant");
      return;
    }
    
    // Update local state immediately for a responsive UI
    setLocalTourGroups(updatedGroups);
    
    // Get destination group ID for database update
    const destGroupId = currentGroups[toGroupIndex].id;
    
    if (!destGroupId) {
      console.error("Missing destination group ID for database update");
      toast.error("Cannot update database: Missing group information");
      return;
    }
    
    // Add retry logic for database updates
    const maxRetries = 3;
    let attempts = 0;
    
    const attemptDatabaseUpdate = () => {
      attempts++;
      // First, update the participant in the database with retry logic
      updateParticipantGroupInDatabase(participant.id, destGroupId)
        .then(success => {
          if (success) {
            console.log(`Successfully updated participant ${participant.id} in database`);
            toast.success(`Moved ${participant.name} to ${updatedGroups[toGroupIndex].name || `Group ${toGroupIndex + 1}`}`);
            
            // Then attempt to update the groups on the server with additional delay
            // to ensure the participant update is processed first
            setTimeout(() => {
              updateTourGroupsMutation.mutate(updatedGroups);
            }, 500);
          } else if (attempts < maxRetries) {
            console.warn(`Retry ${attempts}/${maxRetries} for participant ${participant.id} database update`);
            setTimeout(attemptDatabaseUpdate, 1000);
          } else {
            console.error(`Failed to update participant ${participant.id} in database after ${maxRetries} attempts`);
            toast.error("Failed to save changes in database. Try refreshing the page.");
          }
        })
        .catch(error => {
          console.error("Exception updating participant in database:", error);
          if (attempts < maxRetries) {
            console.warn(`Retry ${attempts}/${maxRetries} for participant ${participant.id} database update after error`);
            setTimeout(attemptDatabaseUpdate, 1000);
          } else {
            toast.error("Error saving changes to database after multiple attempts");
          }
        });
    };
    
    // Start the retry process
    attemptDatabaseUpdate();
    
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
