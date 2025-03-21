
import { useCallback } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useParticipantMovement } from "./useParticipantMovement";
import { useQueryClient } from "@tanstack/react-query";
import { useTourGroupState } from "./useTourGroupState";
import { useParticipantRefresh } from "./useParticipantRefresh";
import { useParticipantOperations } from "./useParticipantOperations";

/**
 * Primary hook for tour group and participant management
 */
export const useGroupManagement = (tour: TourCardProps) => {
  const queryClient = useQueryClient();
  console.log("PARTICIPANTS DEBUG: useGroupManagement initialized with tour:", tour.id);
  
  // Get tour group state management
  const { 
    localTourGroups, 
    setLocalTourGroups, 
    recalculateGroupSizes 
  } = useTourGroupState(tour);
  
  // Get participant movement capabilities from the hook
  const {
    selectedParticipant,
    isMovePending,
    handleMoveParticipant: moveParticipantToGroup,
    handleOpenMoveDialog: setSelectedParticipant,
    handleCloseMoveDialog: clearSelectedParticipant
  } = useParticipantMovement(tour.id, localTourGroups);
  
  // Get participant refresh capabilities
  const {
    loadParticipants,
    refreshParticipants,
    isLoadingParticipants
  } = useParticipantRefresh(
    tour.id, 
    localTourGroups, 
    setLocalTourGroups, 
    recalculateGroupSizes
  );
  
  // Get participant operations capabilities
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragPending,
    draggedParticipant,
    handleMoveParticipant
  } = useParticipantOperations(
    tour.id,
    localTourGroups,
    setLocalTourGroups,
    moveParticipantToGroup
  );

  return {
    // Group state
    localTourGroups,
    
    // Participant selection and movement
    selectedParticipant,
    handleMoveParticipant,
    setSelectedParticipant,
    
    // Drag and drop
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    draggedParticipant,
    
    // Loading states
    isMovePending: isMovePending || isDragPending || isLoadingParticipants,
    
    // Data operations
    loadParticipants,
    refreshParticipants
  };
};
