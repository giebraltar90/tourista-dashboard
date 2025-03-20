
import { useState, useEffect, useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useParticipantMovement } from "./useParticipantMovement";
import { useDragAndDrop } from "./useDragAndDrop";
import { useParticipantLoading } from "./useParticipantLoading";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGroupManagement = (tour: TourCardProps) => {
  const queryClient = useQueryClient();
  console.log("useGroupManagement initialized with tour:", tour.id);
  
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>(() => {
    console.log("Initial localTourGroups setup from tour.tourGroups:", tour.tourGroups);
    // Create a deep copy of tour groups with participants
    const groups = JSON.parse(JSON.stringify(tour.tourGroups || []));
    
    // Ensure each group has a participants array
    return groups.map((group: VentrataTourGroup) => ({
      ...group,
      participants: Array.isArray(group.participants) ? group.participants : []
    }));
  });
  
  // Update local groups when tour groups change
  useEffect(() => {
    if (tour.tourGroups) {
      console.log("Tour groups changed, updating localTourGroups:", tour.tourGroups);
      const updatedGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      // Ensure each group has a participants array
      const normalizedGroups = updatedGroups.map((group: VentrataTourGroup) => ({
        ...group,
        participants: Array.isArray(group.participants) ? group.participants : []
      }));
      setLocalTourGroups(normalizedGroups);
    }
  }, [tour.tourGroups]);
  
  // Get participant loading capabilities
  const { loadParticipants: loadParticipantsInner } = useParticipantLoading();
  
  // Wrapper for loadParticipants to include setLocalTourGroups
  const loadParticipants = useCallback((tourId: string) => {
    return loadParticipantsInner(tourId, setLocalTourGroups);
  }, [loadParticipantsInner]);

  // Get participant movement capabilities from the hook
  const {
    selectedParticipant,
    isMovePending,
    handleMoveParticipant: moveParticipantToGroup,
    handleOpenMoveDialog: setSelectedParticipant,
    handleCloseMoveDialog: clearSelectedParticipant
  } = useParticipantMovement(tour.id, localTourGroups);
  
  // Use the drag and drop functionality with a participant updater function
  const { 
    handleDragStart,
    handleDragOver,
    handleDrop: dropParticipant,
    isDragPending
  } = useDragAndDrop(tour.id, (fromGroupIndex, toGroupIndex, participant, currentGroups) => {
    // Exit early if trying to drop in the same group
    if (fromGroupIndex === toGroupIndex) {
      return null;
    }
    
    // Create a deep copy to avoid mutation
    const updatedGroups = JSON.parse(JSON.stringify(currentGroups));
    
    // Remove from source
    if (updatedGroups[fromGroupIndex]?.participants) {
      updatedGroups[fromGroupIndex].participants = 
        updatedGroups[fromGroupIndex].participants.filter((p: any) => p.id !== participant.id);
      
      // Update counts
      const participantCount = participant.count || 1;
      const childCount = participant.childCount || 0;
      
      updatedGroups[fromGroupIndex].size = Math.max(0, (updatedGroups[fromGroupIndex].size || 0) - participantCount);
      updatedGroups[fromGroupIndex].childCount = Math.max(0, (updatedGroups[fromGroupIndex].childCount || 0) - childCount);
    }
    
    // Add to destination
    if (!updatedGroups[toGroupIndex].participants) {
      updatedGroups[toGroupIndex].participants = [];
    }
    
    // Update participant's group_id
    const updatedParticipant = {
      ...participant, 
      group_id: updatedGroups[toGroupIndex].id
    };
    updatedGroups[toGroupIndex].participants.push(updatedParticipant);
    
    // Update counts
    const participantCount = participant.count || 1;
    const childCount = participant.childCount || 0;
    
    updatedGroups[toGroupIndex].size = (updatedGroups[toGroupIndex].size || 0) + participantCount;
    updatedGroups[toGroupIndex].childCount = (updatedGroups[toGroupIndex].childCount || 0) + childCount;
    
    return updatedGroups;
  });
  
  // Wrapper for moving a participant to a specific group
  const handleMoveParticipant = (toGroupIndex: number) => {
    if (toGroupIndex >= 0 && toGroupIndex < localTourGroups.length) {
      moveParticipantToGroup(toGroupIndex);
    } else {
      console.error("Invalid group index for move operation:", toGroupIndex);
      toast.error("Cannot move participant: Invalid group selection");
    }
  };
  
  // Handler for dropping a participant into a group
  const handleDrop = (e: React.DragEvent, toGroupIndex: number) => {
    if (toGroupIndex >= 0 && toGroupIndex < localTourGroups.length) {
      dropParticipant(e, toGroupIndex, localTourGroups, setLocalTourGroups);
    } else {
      console.error("Invalid group index for drop operation:", toGroupIndex);
    }
  };

  return {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setSelectedParticipant,
    isMovePending: isMovePending || isDragPending,
    loadParticipants
  };
};
