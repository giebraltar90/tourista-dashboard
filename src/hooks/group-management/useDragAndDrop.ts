
import { useCallback, useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { updateParticipant } from "@/services/api/tourApi";

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
    console.log("Drag started:", { participant, fromGroup });
    e.dataTransfer.setData("application/json", JSON.stringify({
      participant,
      fromGroupIndex: fromGroup
    }));
    
    // Also store in state for safety (in case dataTransfer fails)
    setDraggedParticipant(participant);
    setFromGroupIndex(fromGroup);
  }, []);
  
  // Handler for drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    // Necessary to make the element a drop target
    e.preventDefault();
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
    
    // Block during pending operations
    if (isDragPending) {
      console.log("Drop ignored - operation already pending");
      return;
    }
    
    let dropData;
    
    try {
      // Get data from dataTransfer
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        dropData = JSON.parse(jsonData);
      }
    } catch (error) {
      console.error("Error parsing drag data:", error);
    }
    
    // Fallback to state if dataTransfer failed
    if (!dropData && draggedParticipant && fromGroupIndex !== null) {
      dropData = {
        participant: draggedParticipant,
        fromGroupIndex
      };
    }
    
    if (!dropData) {
      console.error("No drag data available");
      return;
    }
    
    const { participant, fromGroupIndex: sourceGroupIndex } = dropData;
    
    console.log("Drop data:", { participant, sourceGroupIndex, toGroupIndex });
    
    // If same group, do nothing
    if (sourceGroupIndex === toGroupIndex) {
      console.log("Dropped in same group, ignoring");
      return;
    }
    
    // Block invalid operations
    if (!participant || sourceGroupIndex === undefined || toGroupIndex === undefined) {
      console.error("Invalid drop operation - missing required data", { participant, sourceGroupIndex, toGroupIndex });
      return;
    }
    
    try {
      setIsDragPending(true);
      
      console.log("Updating groups via updaterFn");
      // Apply the update function to get new groups state
      const updatedGroups = updaterFn(sourceGroupIndex, toGroupIndex, participant, currentGroups);
      
      if (!updatedGroups) {
        console.log("Update function returned null, aborting");
        return;
      }
      
      // Update UI immediately (optimistic update)
      setGroups(updatedGroups);
      
      // Get the destination group ID
      const destinationGroupId = currentGroups[toGroupIndex]?.id;
      
      if (!destinationGroupId) {
        console.error("Missing destination group ID");
        toast.error("Failed to move participant: Missing group information");
        return;
      }
      
      console.log(`Updating participant ${participant.id} to group ${destinationGroupId}`);
      
      // Persist the change to the database
      const success = await updateParticipant(participant.id, destinationGroupId);
      
      if (success) {
        toast.success("Participant moved successfully");
      } else {
        // If failed, revert the UI
        toast.error("Failed to move participant");
        setGroups(currentGroups);
      }
    } catch (error) {
      console.error("Error during drop handling:", error);
      toast.error("Error moving participant");
      // Revert UI on error
      setGroups(currentGroups);
    } finally {
      setIsDragPending(false);
      // Clear drag state
      setDraggedParticipant(null);
      setFromGroupIndex(null);
    }
  }, [isDragPending, draggedParticipant, fromGroupIndex, updaterFn]);
  
  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragPending
  };
};
