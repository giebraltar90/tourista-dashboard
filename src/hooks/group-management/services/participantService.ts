
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";

/**
 * Move a participant from one group to another
 */
export const moveParticipant = (
  fromGroupIndex: number,
  toGroupIndex: number,
  participant: VentrataParticipant,
  currentGroups: VentrataTourGroup[]
) => {
  if (fromGroupIndex === toGroupIndex) {
    toast.error("Participant is already in this group");
    return null;
  }
  
  // Create a deep copy of the current tour groups
  const updatedTourGroups = JSON.parse(JSON.stringify(currentGroups));
  
  const sourceGroup = updatedTourGroups[fromGroupIndex];
  if (!sourceGroup) {
    toast.error("Source group not found");
    return null;
  }
  
  // Ensure participants array exists
  if (!Array.isArray(sourceGroup.participants)) {
    sourceGroup.participants = [];
  }
  
  // Remove participant from source group
  sourceGroup.participants = sourceGroup.participants.filter(
    (p: VentrataParticipant) => p.id !== participant.id
  );
  
  // Update source group's size property based on actual participant count
  sourceGroup.size = sourceGroup.participants.reduce(
    (total: number, p: VentrataParticipant) => total + (p.count || 1),
    0
  );
  
  // Update child count if needed
  if (participant.childCount) {
    sourceGroup.childCount = Math.max(0, (sourceGroup.childCount || 0) - participant.childCount);
  }
  
  const destGroup = updatedTourGroups[toGroupIndex];
  if (!destGroup) {
    toast.error("Destination group not found");
    return null;
  }
  
  // Ensure participants array exists in destination group
  if (!Array.isArray(destGroup.participants)) {
    destGroup.participants = [];
  }
  
  // Add participant to destination group
  destGroup.participants.push(participant);
  
  // Update destination group's size property based on actual participant count
  destGroup.size = destGroup.participants.reduce(
    (total: number, p: VentrataParticipant) => total + (p.count || 1),
    0
  );
  
  // Update child count if needed
  if (participant.childCount) {
    destGroup.childCount = (destGroup.childCount || 0) + participant.childCount;
  }
  
  return updatedTourGroups;
};

/**
 * Calculate the total number of participants in all groups
 */
export const calculateTotalParticipants = (groups: VentrataTourGroup[]): number => {
  if (!Array.isArray(groups)) return 0;
  
  return groups.reduce((total, group) => {
    return total + (group.size || 0);
  }, 0);
};
