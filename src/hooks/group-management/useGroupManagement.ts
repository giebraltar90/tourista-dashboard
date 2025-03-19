
import { useState, useEffect } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useParticipantMovement } from "./useParticipantMovement";
import { useDragAndDrop } from "./useDragAndDrop";

export const useGroupManagement = (tour: TourCardProps) => {
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>(() => {
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
      const updatedGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      // Ensure each group has a participants array
      const normalizedGroups = updatedGroups.map((group: VentrataTourGroup) => ({
        ...group,
        participants: Array.isArray(group.participants) ? group.participants : []
      }));
      setLocalTourGroups(normalizedGroups);
    }
  }, [tour.tourGroups]);
  
  const {
    selectedParticipant,
    setSelectedParticipant,
    handleMoveParticipant: moveParticipant,
    moveParticipant: moveParticipantLogic,
    isMovePending
  } = useParticipantMovement(tour.id, localTourGroups);
  
  const { 
    handleDragStart,
    handleDragOver,
    handleDrop: dropParticipant,
    isDragPending
  } = useDragAndDrop(tour.id, moveParticipantLogic);
  
  // Wrapper functions to pass the current state
  const handleMoveParticipant = (toGroupIndex: number) => {
    moveParticipant(toGroupIndex, localTourGroups, setLocalTourGroups);
  };
  
  const handleDrop = (e: React.DragEvent, toGroupIndex: number) => {
    dropParticipant(e, toGroupIndex, localTourGroups, setLocalTourGroups);
  };

  return {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setSelectedParticipant,
    isMovePending: isMovePending || isDragPending
  };
};
