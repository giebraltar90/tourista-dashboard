
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useUpdateTourGroups } from "../useTourData";
import { toast } from "sonner";

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
      },
      onSuccess: () => {
        toast.success(`Moved ${participant.name} to ${updatedGroups[toGroupIndex].name || `Group ${toGroupIndex + 1}`}`);
      }
    });
    
    setDraggedParticipant(null);
  };
  
  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragPending: updateTourGroupsMutation.isPending
  };
};
