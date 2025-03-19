
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useUpdateTourGroups } from "../tourData/useUpdateTourGroups";
import { toast } from "sonner";
import { moveParticipant, updateParticipantGroupInDatabase } from "./services/participantService";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useParticipantMovement = (tourId: string, initialGroups: VentrataTourGroup[]) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const updateTourGroupsMutation = useUpdateTourGroups(tourId);
  const queryClient = useQueryClient(); // Get queryClient directly
  
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
    
    const attemptDatabaseUpdate = async () => {
      attempts++;
      try {
        // First update the participant's group_id in the database
        const { error } = await supabase
          .from('participants')
          .update({ group_id: destGroupId })
          .eq('id', participant.id);
          
        if (error) {
          console.error(`Database update error (attempt ${attempts}):`, error);
          if (attempts < maxRetries) {
            console.warn(`Retrying participant update ${attempts}/${maxRetries}...`);
            setTimeout(attemptDatabaseUpdate, 1000); // Wait 1 second before retry
            return;
          } else {
            toast.error("Failed to update participant in database after multiple attempts");
            return;
          }
        }
        
        console.log(`Successfully updated participant ${participant.id} in database`);
        toast.success(`Moved ${participant.name} to ${updatedGroups[toGroupIndex].name || `Group ${toGroupIndex + 1}`}`);
        
        // Then after a delay, also update the tour groups to ensure everything is in sync
        setTimeout(() => {
          // Cancel any in-flight queries before sending our update
          // Access queryClient directly instead of through mutation context
          queryClient.cancelQueries({ queryKey: ['tour', tourId] });
          queryClient.cancelQueries({ queryKey: ['tours'] });
          
          updateTourGroups(updatedGroups);
        }, 500);
      } catch (error) {
        console.error("Error updating participant in database:", error);
        if (attempts < maxRetries) {
          setTimeout(attemptDatabaseUpdate, 1000);
        } else {
          toast.error("Error updating database after multiple attempts");
        }
      }
    };
    
    // Start the update process
    attemptDatabaseUpdate();
    
    setSelectedParticipant(null);
  };
  
  // A separate function to update tour groups with retry mechanism
  const updateTourGroups = async (updatedGroups: VentrataTourGroup[]) => {
    try {
      // Cancel any pending queries to avoid overwriting our optimistic updates
      queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      queryClient.cancelQueries({ queryKey: ['tours'] });
      
      // Update the tour groups on the server - don't wait for completion
      updateTourGroupsMutation.mutate(updatedGroups);
    } catch (error) {
      console.error("Error updating tour groups:", error);
    }
  };
  
  return {
    selectedParticipant,
    setSelectedParticipant,
    handleMoveParticipant,
    moveParticipant,
    isMovePending: updateTourGroupsMutation.isPending
  };
};
