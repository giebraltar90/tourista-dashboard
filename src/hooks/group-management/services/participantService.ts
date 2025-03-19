
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Move a participant from one group to another
 */
export const moveParticipant = (
  fromGroupIndex: number,
  toGroupIndex: number,
  participant: VentrataParticipant,
  currentGroups: VentrataTourGroup[]
): VentrataTourGroup[] | null => {
  if (fromGroupIndex === toGroupIndex) {
    toast.error("Participant is already in this group");
    return null;
  }
  
  // Validate group indices
  if (fromGroupIndex < 0 || fromGroupIndex >= currentGroups.length) {
    toast.error("Source group not found");
    return null;
  }
  
  if (toGroupIndex < 0 || toGroupIndex >= currentGroups.length) {
    toast.error("Destination group not found");
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
  
  console.log("Moved participant:", {
    participant,
    from: sourceGroup.name || `Group ${fromGroupIndex + 1}`,
    to: destGroup.name || `Group ${toGroupIndex + 1}`
  });
  
  return updatedTourGroups;
};

/**
 * Update the participant's group assignment in Supabase database
 * Significantly improved with retry logic and better error handling
 */
export const updateParticipantGroupInDatabase = async (
  participantId: string,
  newGroupId: string
): Promise<boolean> => {
  if (!participantId || !newGroupId) {
    console.error("Missing required parameters for updateParticipantGroupInDatabase");
    return false;
  }

  // Maximum retry attempts
  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    try {
      console.log(`Updating participant ${participantId} to group ${newGroupId} in database (attempt ${attempt + 1})`);
      
      const { error } = await supabase
        .from('participants')
        .update({ group_id: newGroupId })
        .eq('id', participantId);
        
      if (error) {
        console.error(`Error updating participant in database (attempt ${attempt + 1}):`, error);
      } else {
        console.log(`Successfully updated participant ${participantId} in database`);
        
        // Add a delay to let the database update settle
        await new Promise(resolve => setTimeout(resolve, 300));
        
        success = true;
        break;
      }
    } catch (error) {
      console.error(`Exception updating participant in database (attempt ${attempt + 1}):`, error);
    }
    
    // Increment attempt counter
    attempt++;
    
    // Only delay if we're going to retry
    if (!success && attempt < MAX_RETRIES) {
      const backoffTime = Math.min(300 * Math.pow(2, attempt), 2000); // Exponential backoff
      console.log(`Waiting ${backoffTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  return success;
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

/**
 * Fetch participants for a tour group from Supabase
 */
export const fetchParticipantsForGroup = async (groupId: string) => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('group_id', groupId);
      
    if (error) {
      console.error("Error fetching participants:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchParticipantsForGroup:", error);
    return [];
  }
};
