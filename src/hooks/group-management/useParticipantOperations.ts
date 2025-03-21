
import { useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { toast } from "sonner";
import { useDragAndDrop } from "./useDragAndDrop";

/**
 * Hook for handling participant movement operations like drag and drop
 */
export const useParticipantOperations = (
  tourId: string,
  localTourGroups: VentrataTourGroup[],
  setLocalTourGroups: (groups: VentrataTourGroup[]) => void,
  moveParticipantToGroup: (toGroupIndex: number) => void
) => {
  // Use the drag and drop functionality with a participant updater function
  const { 
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop: dropParticipant,
    isDragPending,
    draggedParticipant
  } = useDragAndDrop(tourId, (fromGroupIndex, toGroupIndex, participant, currentGroups) => {
    // Exit early if trying to drop in the same group
    if (fromGroupIndex === toGroupIndex) {
      return null;
    }
    
    console.log(`PARTICIPANTS DEBUG: Moving participant from group ${fromGroupIndex} to group ${toGroupIndex}:`, {
      participant: {
        id: participant.id,
        name: participant.name,
        count: participant.count || 1,
        childCount: participant.childCount || 0
      }
    });
    
    // Create a deep copy to avoid mutation
    const updatedGroups = JSON.parse(JSON.stringify(currentGroups));
    
    // Remove from source
    if (updatedGroups[fromGroupIndex]?.participants) {
      updatedGroups[fromGroupIndex].participants = 
        updatedGroups[fromGroupIndex].participants.filter((p: any) => p.id !== participant.id);
      
      // Recalculate size from scratch based on remaining participants
      let newSize = 0;
      let newChildCount = 0;
      
      for (const p of updatedGroups[fromGroupIndex].participants) {
        newSize += p.count || 1;
        newChildCount += p.childCount || 0;
      }
      
      updatedGroups[fromGroupIndex].size = newSize;
      updatedGroups[fromGroupIndex].childCount = newChildCount;
      
      console.log(`PARTICIPANTS DEBUG: After removal from group ${fromGroupIndex}:`, {
        remainingParticipants: updatedGroups[fromGroupIndex].participants.length,
        newSize,
        newChildCount
      });
    }
    
    // Add to destination
    if (!Array.isArray(updatedGroups[toGroupIndex].participants)) {
      updatedGroups[toGroupIndex].participants = [];
    }
    
    // Update participant's group_id
    const updatedParticipant = {
      ...participant, 
      groupId: updatedGroups[toGroupIndex].id,
      group_id: updatedGroups[toGroupIndex].id
    };
    updatedGroups[toGroupIndex].participants.push(updatedParticipant);
    
    // Recalculate size from scratch
    let newToSize = 0;
    let newToChildCount = 0;
    
    for (const p of updatedGroups[toGroupIndex].participants) {
      newToSize += p.count || 1;
      newToChildCount += p.childCount || 0;
    }
    
    updatedGroups[toGroupIndex].size = newToSize;
    updatedGroups[toGroupIndex].childCount = newToChildCount;
    
    console.log(`PARTICIPANTS DEBUG: After addition to group ${toGroupIndex}:`, {
      totalParticipants: updatedGroups[toGroupIndex].participants.length,
      newSize: newToSize,
      newChildCount: newToChildCount
    });
    
    return updatedGroups;
  });
  
  // Wrapper for moving a participant to a specific group
  const handleMoveParticipant = useCallback((toGroupIndex: number) => {
    if (toGroupIndex >= 0 && toGroupIndex < localTourGroups.length) {
      console.log(`PARTICIPANTS DEBUG: Moving participant to group ${toGroupIndex}`);
      moveParticipantToGroup(toGroupIndex);
    } else {
      console.error("PARTICIPANTS DEBUG: Invalid group index for move operation:", toGroupIndex);
      toast.error("Cannot move participant: Invalid group selection");
    }
  }, [localTourGroups, moveParticipantToGroup]);
  
  // Handler for dropping a participant into a group
  const handleDrop = useCallback((e: React.DragEvent, toGroupIndex: number) => {
    if (toGroupIndex >= 0 && toGroupIndex < localTourGroups.length) {
      console.log(`PARTICIPANTS DEBUG: Dropping participant into group ${toGroupIndex}`);
      
      // Pass the actual groups array to dropParticipant
      dropParticipant(e, toGroupIndex, localTourGroups, (updatedGroups) => {
        if (updatedGroups) {
          console.log(`PARTICIPANTS DEBUG: After drop into group ${toGroupIndex}, updating groups:`, 
            updatedGroups.map(g => ({
              id: g.id,
              name: g.name || 'Unnamed',
              size: g.size,
              childCount: g.childCount,
              participantsCount: g.participants?.length || 0
            }))
          );
          
          // Call the state setter with the updated groups
          setLocalTourGroups(updatedGroups);
        }
      });
    } else {
      console.error("PARTICIPANTS DEBUG: Invalid group index for drop operation:", toGroupIndex);
    }
  }, [localTourGroups, dropParticipant, setLocalTourGroups]);

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragPending,
    draggedParticipant,
    handleMoveParticipant
  };
};
