import { useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useUpdateTourGroups } from "./useTourData";
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
      sourceGroup.size -= participant.count;
    }
    
    const destGroup = updatedTourGroups[toGroupIndex];
    if (!destGroup.participants) {
      destGroup.participants = [];
    }
    destGroup.participants.push(participant);
    destGroup.size += participant.count;
    
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
      sourceGroup.size -= participant.count;
    }
    
    const destGroup = updatedTourGroups[toGroupIndex];
    if (!destGroup.participants) {
      destGroup.participants = [];
    }
    destGroup.participants.push(participant);
    destGroup.size += participant.count;
    
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

// Hook for adding a new group
export const useAddGroup = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  
  const addGroup = async (newGroup: VentrataTourGroup) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      const updatedTourGroups = [...tour.tourGroups, newGroup];
      await updateTourGroups(tourId, updatedTourGroups);
      
      // Refetch tour data to update UI
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error adding group:", error);
      throw error;
    }
  };
  
  return { addGroup };
};

// Hook for updating a group
export const useUpdateGroup = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  
  const updateGroup = async (groupIndex: number, updatedGroup: VentrataTourGroup) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      const updatedTourGroups = [...tour.tourGroups];
      updatedTourGroups[groupIndex] = updatedGroup;
      
      await updateTourGroups(tourId, updatedTourGroups);
      
      // Refetch tour data to update UI
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  };
  
  return { updateGroup };
};

// Hook for assigning a guide to a group
export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { guides } = useGuideData();
  
  const assignGuide = async (groupIndex: number, guideId?: string) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      // Find guide name for the group name update
      let guideName = "";
      if (guideId) {
        if (guideId === "guide1") {
          guideName = tour.guide1;
        } else if (guideId === "guide2" && tour.guide2) {
          guideName = tour.guide2;
        } else if (guideId === "guide3" && tour.guide3) {
          guideName = tour.guide3;
        } else {
          // Try to find the guide by ID in the guides data
          const guide = guides.find(g => g.id === guideId);
          if (guide) {
            guideName = guide.name;
          }
        }
      }
      
      const updatedTourGroups = [...tour.tourGroups];
      
      // Check if we should update the group name based on the guide
      let groupName = updatedTourGroups[groupIndex].name;
      
      // If the group name follows the pattern "X's Group", update it with new guide name
      const namePattern = /^.+'s Group$/;
      if (namePattern.test(groupName) || groupName.includes("Group")) {
        if (guideName) {
          groupName = `${guideName}'s Group`;
        } else {
          // Keep the existing name if we're removing a guide
        }
      }
      
      updatedTourGroups[groupIndex] = {
        ...updatedTourGroups[groupIndex],
        guideId,
        name: groupName
      };
      
      await updateTourGroups(tourId, updatedTourGroups);
      
      // Refetch tour data to update UI
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error assigning guide:", error);
      throw error;
    }
  };
  
  return { assignGuide };
};

// Imports needed for the hooks above that are not already imported
import { useTourById } from "./useTourData";
import { updateTourGroups } from "@/services/ventrataApi";
import { useGuideData } from "./useGuideData";
