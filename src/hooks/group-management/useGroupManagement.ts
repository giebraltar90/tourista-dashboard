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
      
      // Log stably formatted groups for debugging
      console.log("Stable tour groups:", normalizedGroups.map(g => ({
        id: g.id,
        name: g.name,
        size: g.size,
        entryTime: g.entryTime,
        guideId: g.guideId,
        childCount: g.childCount,
        participants: g.participants,
        originalIndex: tour.tourGroups.findIndex((og: any) => og.id === g.id),
        displayName: g.name
      })));
      
      setLocalTourGroups(normalizedGroups);
    }
  }, [tour.tourGroups]);
  
  // Get participant loading capabilities
  const { loadParticipants: loadParticipantsInner, isLoading: isLoadingParticipants } = useParticipantLoading();
  
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
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop: dropParticipant,
    isDragPending,
    draggedParticipant
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
      groupId: updatedGroups[toGroupIndex].id,
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

  // Add a refresh function to manually trigger participant loading
  const refreshParticipants = useCallback(() => {
    if (tour.id) {
      toast.info("Refreshing participants...");
      loadParticipants(tour.id);
      
      // CRITICAL FIX: Force recalculation of all group sizes after refresh
      setTimeout(() => {
        setLocalTourGroups(prevGroups => {
          // Create deep copy to avoid mutation issues
          const updatedGroups = JSON.parse(JSON.stringify(prevGroups));
          
          // Recalculate all group sizes from participants
          return updatedGroups.map((group: VentrataTourGroup) => {
            // Create a new object to avoid mutations
            const updatedGroup = {...group};
            
            // Calculate directly from participants array if it exists
            if (Array.isArray(updatedGroup.participants) && updatedGroup.participants.length > 0) {
              let totalSize = 0;
              let totalChildCount = 0;
              
              for (const p of updatedGroup.participants) {
                totalSize += p.count || 1;
                totalChildCount += p.childCount || 0;
              }
              
              // Set the size and childCount based on calculated values
              updatedGroup.size = totalSize;
              updatedGroup.childCount = totalChildCount;
            } else {
              // If no participants, size should be 0
              updatedGroup.size = 0;
              updatedGroup.childCount = 0;
            }
            
            return updatedGroup;
          });
        });
      }, 500);
    }
  }, [tour.id, loadParticipants]);

  return {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setSelectedParticipant,
    isMovePending: isMovePending || isDragPending || isLoadingParticipants,
    loadParticipants,
    refreshParticipants,
    draggedParticipant
  };
};
