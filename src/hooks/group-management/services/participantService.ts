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
    toast.info("Participant is already in this group");
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
  const destGroup = updatedTourGroups[toGroupIndex];
  
  if (!sourceGroup || !destGroup) {
    toast.error("Group not found");
    return null;
  }
  
  // Ensure participants arrays exist
  if (!Array.isArray(sourceGroup.participants)) {
    sourceGroup.participants = [];
  }
  
  if (!Array.isArray(destGroup.participants)) {
    destGroup.participants = [];
  }
  
  // Get participant count values, defaulting to 1 if not specified
  const participantCount = participant.count || 1;
  const childCount = participant.childCount || 0;
  
  // Remove from source group
  sourceGroup.participants = sourceGroup.participants.filter(
    (p: VentrataParticipant) => p.id !== participant.id
  );
  
  // Update source group's size and child count
  sourceGroup.size = Math.max(0, (sourceGroup.size || 0) - participantCount);
  sourceGroup.childCount = Math.max(0, (sourceGroup.childCount || 0) - childCount);
  
  // Add to destination group with updated group_id
  const updatedParticipant = {
    ...participant,
    group_id: destGroup.id
  };
  destGroup.participants.push(updatedParticipant);
  
  // Update destination group's size and child count
  destGroup.size = (destGroup.size || 0) + participantCount;
  destGroup.childCount = (destGroup.childCount || 0) + childCount;
  
  return updatedTourGroups;
};

/**
 * Update the participant's group assignment in Supabase database
 * With retry logic and better error handling
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
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Updating participant ${participantId} to group ${newGroupId} (attempt ${attempt + 1})`);
      
      const { error } = await supabase
        .from('participants')
        .update({ group_id: newGroupId })
        .eq('id', participantId);
        
      if (error) {
        console.error(`Error updating participant (attempt ${attempt + 1}):`, error);
        
        if (attempt < MAX_RETRIES - 1) {
          // Exponential backoff with jitter
          const backoffTime = Math.min(300 * Math.pow(2, attempt) * (0.8 + Math.random() * 0.4), 2000);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          continue;
        }
        return false;
      }
      
      console.log(`Successfully updated participant ${participantId} in database`);
      return true;
    } catch (error) {
      console.error(`Exception updating participant (attempt ${attempt + 1}):`, error);
      
      if (attempt < MAX_RETRIES - 1) {
        const backoffTime = Math.min(300 * Math.pow(2, attempt), 2000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        return false;
      }
    }
  }
  
  return false;
};

/**
 * Calculate the total number of participants in all groups
 * Improved to accurately count from participants array when available
 */
export const calculateTotalParticipants = (groups: VentrataTourGroup[]): number => {
  if (!Array.isArray(groups)) return 0;
  
  return groups.reduce((total, group) => {
    // If we have a participants array, calculate from it for maximum accuracy
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return total + group.participants.reduce((sum, p) => sum + (p.count || 1), 0);
    }
    // Otherwise fall back to the group size property
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
    
    return data ? data.map(p => ({
      id: p.id,
      name: p.name,
      count: p.count || 1,
      bookingRef: p.booking_ref,
      childCount: p.child_count || 0,
      group_id: p.group_id
    })) : [];
  } catch (error) {
    console.error("Error in fetchParticipantsForGroup:", error);
    return [];
  }
};
