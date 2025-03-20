import { useCallback, useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { 
  handleDragStartEvent, 
  handleDragEndEvent,
  processDrop,
  extractParticipantFromDropEvent
} from "./services/dragAndDropService";

type UpdaterFunction = (
  fromGroupIndex: number,
  toGroupIndex: number,
  participant: VentrataParticipant,
  currentGroups: VentrataTourGroup[]
) => VentrataTourGroup[] | null;

export const useDragAndDrop = (
  tourId: string,
  updaterFn: UpdaterFunction
) => {
  const [isDragPending, setIsDragPending] = useState(false);
  const [draggedParticipant, setDraggedParticipant] = useState<VentrataParticipant | null>(null);
  const [fromGroupIndex, setFromGroupIndex] = useState<number | null>(null);
  
  // Handler for drag start
  const handleDragStart = useCallback((
    e: React.DragEvent, 
    participant: VentrataParticipant,
    fromGroup: number
  ) => {
    const dragData = handleDragStartEvent(e, participant, fromGroup);
    
    // Store in state for safety (in case dataTransfer fails)
    setDraggedParticipant(dragData.participant);
    setFromGroupIndex(dragData.fromGroupIndex);
  }, []);
  
  // Handler for drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    handleDragEndEvent(e);
    
    // Only clear drag state on successful drops
    if (!isDragPending) {
      setDraggedParticipant(null);
      setFromGroupIndex(null);
    }
  }, [isDragPending]);
  
  // Handler for drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    // Necessary to make the element a drop target
    e.preventDefault();
    
    // Add visual indication that this is a drop target
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add('drag-over');
    }
  }, []);
  
  // Handler for drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Remove visual indication
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('drag-over');
    }
  }, []);
  
  // Handler for drop
  const handleDrop = useCallback(async (
    e: React.DragEvent, 
    toGroupIndex: number,
    currentGroups: VentrataTourGroup[],
    setGroups: React.Dispatch<React.SetStateAction<VentrataTourGroup[]>>
  ) => {
    e.preventDefault();
    console.log("Drop detected on group index:", toGroupIndex);
    
    // Remove visual indication
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('drag-over');
    }
    
    // Block during pending operations
    if (isDragPending) {
      console.log("Drop ignored - operation already pending");
      return;
    }
    
    // Extract data from the drop event
    const { participant, fromGroupIndex: sourceGroupIndex } = extractParticipantFromDropEvent(
      e,
      draggedParticipant,
      fromGroupIndex
    );
    
    if (!participant || sourceGroupIndex === null) {
      console.error("Invalid drop operation - missing required data");
      return;
    }
    
    console.log("Drop data:", { participant, sourceGroupIndex, toGroupIndex });
    
    // If same group, do nothing
    if (sourceGroupIndex === toGroupIndex) {
      console.log("Dropped in same group, ignoring");
      return;
    }
    
    try {
      setIsDragPending(true);
      
      // Process the drop operation
      const { success, updatedGroups } = await processDrop(
        sourceGroupIndex,
        toGroupIndex,
        participant,
        currentGroups,
        updaterFn
      );
      
      // Update state if successful
      if (success && updatedGroups) {
        // CRITICAL FIX: Ensure all group sizes are recalculated based on participants
        const recalculatedGroups = updatedGroups.map(group => {
          // Create a new object to avoid mutations
          const updatedGroup = {...group};
          
          if (Array.isArray(updatedGroup.participants)) {
            let totalSize = 0;
            let totalChildCount = 0;
            
            for (const p of updatedGroup.participants) {
              totalSize += p.count || 1;
              totalChildCount += p.childCount || 0;
            }
            
            // Always set the size and childCount based on calculated values
            updatedGroup.size = totalSize;
            updatedGroup.childCount = totalChildCount;
          } else {
            // If no participants, size should be 0
            updatedGroup.size = 0;
            updatedGroup.childCount = 0;
          }
          
          return updatedGroup;
        });
        
        // Apply the recalculated groups
        setGroups(recalculatedGroups);
      } else if (!success) {
        // If operation failed but we tried to update UI, revert
        setGroups(currentGroups);
      }
    } finally {
      setIsDragPending(false);
      // Clear drag state
      setDraggedParticipant(null);
      setFromGroupIndex(null);
    }
  }, [isDragPending, draggedParticipant, fromGroupIndex, updaterFn]);
  
  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragPending,
    draggedParticipant,
    fromGroupIndex
  };
};
