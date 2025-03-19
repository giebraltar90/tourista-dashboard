
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useUpdateTourGroups } from "../tourData/useUpdateTourGroups";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const handleDrop = async (
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
    
    // Immediately attempt to update the participant in Supabase
    const { error } = await supabase
      .from('participants')
      .update({ group_id: destGroupId })
      .eq('id', participant.id);
      
    if (error) {
      console.error("Error updating participant in database:", error);
      toast.error("Failed to update participant's group in database");
      
      // Try again with a retry mechanism
      retryParticipantUpdate(participant.id, destGroupId, 3);
    } else {
      console.log(`Successfully updated participant ${participant.id} to group ${destGroupId}`);
      toast.success(`Moved ${participant.name} to ${updatedGroups[toGroupIndex].name || `Group ${toGroupIndex + 1}`}`);
      
      // After a delay, also update the tour groups with our changes
      setTimeout(() => {
        // Cancel any in-flight queries before sending our update
        const queryClient = updateTourGroupsMutation.context?.queryClient;
        if (queryClient) {
          queryClient.cancelQueries({ queryKey: ['tour', tourId] });
          queryClient.cancelQueries({ queryKey: ['tours'] });
        }
        
        // Update tour groups
        updateTourGroupsMutation.mutate(updatedGroups);
      }, 500);
    }
    
    setDraggedParticipant(null);
  };
  
  // Retry function for participant updates
  const retryParticipantUpdate = async (participantId: string, destGroupId: string, retriesLeft: number) => {
    if (retriesLeft <= 0) {
      toast.error("Failed to update participant after multiple attempts");
      return;
    }
    
    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try update again
      const { error } = await supabase
        .from('participants')
        .update({ group_id: destGroupId })
        .eq('id', participantId);
        
      if (error) {
        console.error(`Retry update failed (${retriesLeft} left):`, error);
        retryParticipantUpdate(participantId, destGroupId, retriesLeft - 1);
      } else {
        console.log(`Participant update succeeded on retry`);
        toast.success("Participant moved successfully");
      }
    } catch (error) {
      console.error("Error in retry:", error);
      retryParticipantUpdate(participantId, destGroupId, retriesLeft - 1);
    }
  };
  
  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragPending: updateTourGroupsMutation.isPending
  };
};
