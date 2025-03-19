
import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useUpdateTourGroups } from "../useTourData";
import { toast } from "sonner";

export const useGroupManagement = (tour: TourCardProps) => {
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>(
    JSON.parse(JSON.stringify(tour.tourGroups))
  );
  
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const [draggedParticipant, setDraggedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const updateTourGroupsMutation = useUpdateTourGroups(tour.id);
  
  const handleMoveParticipant = (toGroupIndex: number) => {
    if (!selectedParticipant) return;
    
    const { participant, fromGroupIndex } = selectedParticipant;
    
    if (fromGroupIndex === toGroupIndex) {
      toast.error("Participant is already in this group");
      return;
    }
    
    // Create a deep copy of the local tour groups
    const updatedTourGroups = JSON.parse(JSON.stringify(localTourGroups));
    
    const sourceGroup = updatedTourGroups[fromGroupIndex];
    if (sourceGroup.participants) {
      sourceGroup.participants = sourceGroup.participants.filter(
        (p: VentrataParticipant) => p.id !== participant.id
      );
      // Update source group size to reflect actual participant counts
      sourceGroup.size = sourceGroup.participants.reduce(
        (total: number, p: VentrataParticipant) => total + (p.count || 1),
        0
      );
      
      // Update child count if needed
      if (participant.childCount) {
        sourceGroup.childCount = (sourceGroup.childCount || 0) - participant.childCount;
      }
    }
    
    const destGroup = updatedTourGroups[toGroupIndex];
    if (!destGroup.participants) {
      destGroup.participants = [];
    }
    destGroup.participants.push(participant);
    
    // Update destination group size to reflect actual participant counts
    destGroup.size = destGroup.participants.reduce(
      (total: number, p: VentrataParticipant) => total + (p.count || 1),
      0
    );
    
    // Update child count if needed
    if (participant.childCount) {
      destGroup.childCount = (destGroup.childCount || 0) + participant.childCount;
    }
    
    // Update local state immediately for a responsive UI
    setLocalTourGroups(updatedTourGroups);
    
    // Then attempt to update on the server
    updateTourGroupsMutation.mutate(updatedTourGroups, {
      onError: (error) => {
        // If the API call fails, we don't revert the UI
        // but we show an error toast
        console.error("API Error:", error);
        toast.error("Changes saved locally only. Server update failed.");
      }
    });
    
    setSelectedParticipant(null);
  };

  // Drag and drop handlers
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

  const handleDrop = (e: React.DragEvent, toGroupIndex: number) => {
    e.preventDefault();
    
    if (!draggedParticipant) return;
    
    const { participant, fromGroupIndex } = draggedParticipant;
    
    if (fromGroupIndex === toGroupIndex) {
      toast.info("Participant is already in this group");
      return;
    }
    
    // Create a deep copy of the local tour groups
    const updatedTourGroups = JSON.parse(JSON.stringify(localTourGroups));
    
    const sourceGroup = updatedTourGroups[fromGroupIndex];
    if (sourceGroup.participants) {
      sourceGroup.participants = sourceGroup.participants.filter(
        (p: VentrataParticipant) => p.id !== participant.id
      );
      
      // Update source group size to reflect actual participant counts
      sourceGroup.size = sourceGroup.participants.reduce(
        (total: number, p: VentrataParticipant) => total + (p.count || 1),
        0
      );
      
      // Update child count if needed
      if (participant.childCount) {
        sourceGroup.childCount = (sourceGroup.childCount || 0) - participant.childCount;
      }
    }
    
    const destGroup = updatedTourGroups[toGroupIndex];
    if (!destGroup.participants) {
      destGroup.participants = [];
    }
    destGroup.participants.push(participant);
    
    // Update destination group size to reflect actual participant counts
    destGroup.size = destGroup.participants.reduce(
      (total: number, p: VentrataParticipant) => total + (p.count || 1),
      0
    );
    
    // Update child count if needed
    if (participant.childCount) {
      destGroup.childCount = (destGroup.childCount || 0) + participant.childCount;
    }
    
    // Update local state immediately for a responsive UI
    setLocalTourGroups(updatedTourGroups);
    
    // Then attempt to update on the server
    updateTourGroupsMutation.mutate(updatedTourGroups, {
      onError: (error) => {
        // If the API call fails, we don't revert the UI
        // but we show an error toast
        console.error("API Error:", error);
        toast.error("Changes saved locally only. Server update failed.");
      }
    });
    
    setDraggedParticipant(null);
    toast.success(`Moved ${participant.name} to ${destGroup.name}`);
  };

  return {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setSelectedParticipant,
    isMovePending: updateTourGroupsMutation.isPending
  };
};
