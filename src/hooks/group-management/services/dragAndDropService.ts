
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { updateParticipant } from "@/services/api/tourApi";

/**
 * Handles the drag start event for a participant
 */
export const handleDragStartEvent = (
  e: React.DragEvent, 
  participant: VentrataParticipant,
  fromGroupIndex: number
) => {
  console.log("Drag started:", { participant, fromGroupIndex });
  
  // Set drag data
  e.dataTransfer.setData("application/json", JSON.stringify({
    participant,
    fromGroupIndex
  }));
  
  // Add visual feedback by changing opacity
  if (e.currentTarget instanceof HTMLElement) {
    e.currentTarget.style.opacity = '0.6';
  }
  
  // Set drag image if browser supports it
  if (e.dataTransfer.setDragImage && e.currentTarget instanceof HTMLElement) {
    e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
  }
  
  return { participant, fromGroupIndex };
};

/**
 * Handles the drag end event to reset visual states
 */
export const handleDragEndEvent = (e: React.DragEvent) => {
  // Reset opacity
  if (e.currentTarget instanceof HTMLElement) {
    e.currentTarget.style.opacity = '1';
  }
};

/**
 * Handles updating state and persistence for drag and drop operations
 */
export const processDrop = async (
  fromGroupIndex: number,
  toGroupIndex: number,
  participant: VentrataParticipant,
  currentGroups: VentrataTourGroup[],
  updaterFn: (
    fromGroupIndex: number,
    toGroupIndex: number,
    participant: VentrataParticipant,
    currentGroups: VentrataTourGroup[]
  ) => VentrataTourGroup[] | null
): Promise<{
  success: boolean;
  updatedGroups: VentrataTourGroup[] | null;
}> => {
  try {
    // Do nothing if same group
    if (fromGroupIndex === toGroupIndex) {
      return { success: false, updatedGroups: null };
    }
    
    // Apply updater function to get new state
    const updatedGroups = updaterFn(
      fromGroupIndex, 
      toGroupIndex, 
      participant, 
      currentGroups
    );
    
    // If updater returned null, abort
    if (!updatedGroups) {
      return { success: false, updatedGroups: null };
    }
    
    // Get the destination group ID
    const destinationGroupId = currentGroups[toGroupIndex]?.id;
    
    if (!destinationGroupId) {
      console.error("Missing destination group ID");
      toast.error("Failed to move participant: Missing group information");
      return { success: false, updatedGroups: null };
    }
    
    console.log(`Updating participant ${participant.id} to group ${destinationGroupId}`);
    
    // Persist the change to the database
    const success = await updateParticipant(participant.id, destinationGroupId);
    
    if (!success) {
      toast.error("Failed to move participant");
      return { success: false, updatedGroups: null };
    }
    
    toast.success("Participant moved successfully");
    return { success: true, updatedGroups };
  } catch (error) {
    console.error("Error during drop handling:", error);
    toast.error("Error moving participant");
    return { success: false, updatedGroups: null };
  }
};

/**
 * Creates a handler to extract participant data from a drop event
 */
export const extractParticipantFromDropEvent = (
  e: React.DragEvent,
  fallbackParticipant: VentrataParticipant | null,
  fallbackGroupIndex: number | null
): { 
  participant: VentrataParticipant | null; 
  fromGroupIndex: number | null;
} => {
  try {
    // Get data from dataTransfer
    const jsonData = e.dataTransfer.getData("application/json");
    if (jsonData) {
      const data = JSON.parse(jsonData);
      return {
        participant: data.participant,
        fromGroupIndex: data.fromGroupIndex
      };
    }
  } catch (error) {
    console.error("Error parsing drag data:", error);
  }
  
  // Fallback to state if dataTransfer failed
  return {
    participant: fallbackParticipant,
    fromGroupIndex: fallbackGroupIndex
  };
};
