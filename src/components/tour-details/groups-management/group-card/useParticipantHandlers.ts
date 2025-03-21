
import { VentrataParticipant } from "@/types/ventrata";
import { useState } from "react";

/**
 * Custom hook to handle participant interactions within a group card
 */
export const useParticipantHandlers = (
  groupIndex: number,
  onDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void,
  onDragEnd: (e?: React.DragEvent) => void,
  onMoveClick: (data: { participant: VentrataParticipant; fromGroupIndex: number }) => void,
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null,
  handleMoveParticipant: (toGroupIndex: number) => void
) => {
  const [isTransferring, setIsTransferring] = useState(false);
  
  // Handle drag start for a participant
  const handleParticipantDragStart = (e: React.DragEvent, participant: VentrataParticipant) => {
    onDragStart(e, participant, groupIndex);
  };
  
  // Handle move click for a participant
  const handleParticipantMoveClick = (participant: VentrataParticipant) => {
    onMoveClick({ participant, fromGroupIndex: groupIndex });
  };
  
  // Check if a participant is currently selected
  const isParticipantSelected = (participantId: string) => {
    return selectedParticipant && 
           selectedParticipant.participant.id === participantId && 
           selectedParticipant.fromGroupIndex === groupIndex;
  };
  
  // Handle move to this group click
  const handleMoveToThisGroup = () => {
    if (!selectedParticipant || selectedParticipant.fromGroupIndex === groupIndex) {
      return;
    }
    
    setIsTransferring(true);
    handleMoveParticipant(groupIndex);
    
    // Reset transferring state after a delay
    setTimeout(() => {
      setIsTransferring(false);
    }, 1000);
  };
  
  return {
    handleParticipantDragStart,
    handleParticipantMoveClick,
    isParticipantSelected,
    handleMoveToThisGroup,
    isTransferring
  };
};
