
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useUpdateTourGroups } from "../tourData/useUpdateTourGroups";
import { toast } from "sonner";
import { updateParticipantGroupInDatabase } from "./services/participantService";

export const useDragAndDrop = (
  tourId: string,
  moveParticipant: (
    fromGroupIndex: number,
    toGroupIndex: number,
    participant: VentrataParticipant,
    currentGroups: VentrataTourGroup[]
  ) => VentrataTourGroup[] | null
) => {
  const [draggedParticipant, setDraggedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const updateTourGroupsMutation = useUpdateTourGroups(tourId);
  
  const handleDragStart = (
    e: React.DragEvent, 
    participant: VentrataParticipant, 
    fromGroupIndex: number
  ) => {
    setDraggedParticipant({ participant, fromGroupIndex });
    e.dataTransfer.setData('application/json', JSON.stringify({ 
      participant, 
      fromGroupIndex 
    }));
    
    // Set a ghost image effect for better UX
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('bg-background', 'p-2', 'rounded', 'border', 'shadow-md');
    ghostElement.textContent = participant.name;
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    
    // Remove the ghost element after a short delay
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (
    e: React.DragEvent, 
    toGroupIndex: number,
    currentGroups: VentrataTourGroup[],
    setLocalTourGroups: (groups: VentrataTourGroup[]) => void
  ) => {
    e.preventDefault();
    
    if (!draggedParticipant) return;
    
    const { participant, fromGroupIndex } = draggedParticipant;
    
    if (fromGroupIndex === toGroupIndex) {
      toast.info("Participant is already in this group");
      return;
    }
    
    // Make a deep copy of current groups
    const groupsCopy = JSON.parse(JSON.stringify(currentGroups));
    
    const updatedGroups = moveParticipant(
      fromGroupIndex,
      toGroupIndex,
      participant,
      groupsCopy
    );
    
    if (!updatedGroups) return;
    
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
    
    setDraggedParticipant(null);
  };
  
  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragPending: updateTourGroupsMutation.isPending
  };
};
