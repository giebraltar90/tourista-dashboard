
import { useState } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useParticipantMovement } from "./useParticipantMovement";
import { useDragAndDrop } from "./useDragAndDrop";

export const useGroupManagement = (tour: TourCardProps) => {
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>(
    JSON.parse(JSON.stringify(tour.tourGroups))
  );
  
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
