import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Format the participant count to show adults + children if there are children
 */
export const formatParticipantCount = (totalParticipants: number, childCount: number) => {
  console.log("PARTICIPANTS DEBUG: formatParticipantCount called with", {
    totalParticipants,
    childCount
  });
  
  // Ensure we're working with valid numbers
  const validTotal = isNaN(totalParticipants) ? 0 : Math.max(0, totalParticipants);
  const validChildCount = isNaN(childCount) ? 0 : Math.max(0, childCount);
  
  // Calculate adult count
  const adultCount = Math.max(0, validTotal - validChildCount);
  
  if (validChildCount > 0) {
    console.log(`PARTICIPANTS DEBUG: Formatting as adults+children: ${adultCount}+${validChildCount}`);
    return `${adultCount}+${validChildCount}`;
  } else {
    console.log(`PARTICIPANTS DEBUG: Formatting as just total: ${validTotal}`);
    return `${validTotal}`;
  }
};

/**
 * Move a participant from one group to another
 */
export const moveParticipant = async (
  participantId: string,
  currentGroupId: string,
  newGroupId: string
): Promise<boolean> => {
  console.log("PARTICIPANTS DEBUG: Moving participant", { participantId, currentGroupId, newGroupId });
  
  try {
    const { data, error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId)
      .select();
      
    if (error) {
      console.error("PARTICIPANTS DEBUG: Error moving participant:", error);
      toast.error("Failed to move participant");
      return false;
    }
    
    console.log("PARTICIPANTS DEBUG: Participant moved successfully:", data);
    toast.success("Participant moved successfully");
    return true;
  } catch (error) {
    console.error("PARTICIPANTS DEBUG: Error in moveParticipant:", error);
    toast.error("Error moving participant");
    return false;
  }
};

/**
 * Calculates the total number of participants across all groups
 */
export const calculateTotalParticipants = (tourGroups: VentrataTourGroup[]): number => {
  console.log("PARTICIPANTS DEBUG: calculateTotalParticipants called with", {
    tourGroupsCount: tourGroups.length,
    tourGroupsWithParticipants: tourGroups.filter(g => Array.isArray(g.participants) && g.participants.length > 0).length
  });
  
  // CRITICAL FIX: Only count from participants arrays, NEVER use size property
  let totalParticipants = 0;
  
  if (!Array.isArray(tourGroups)) {
    console.log("PARTICIPANTS DEBUG: tourGroups is not an array, returning 0");
    return 0;
  }
  
  // Process each group one by one
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      
      // Count directly from participants array for accurate totals
      for (const participant of group.participants) {
        const count = participant.count || 1;
        groupTotal += count;
        
        console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}" count ${count} to total`);
      }
      
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" total participants: ${groupTotal}`);
      totalParticipants += groupTotal;
    } else {
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants array or it's empty`);
    }
    // CRITICAL FIX: Completely remove fallback to group.size
  }
  
  console.log("PARTICIPANTS DEBUG: calculateTotalParticipants final result:", totalParticipants);
  return totalParticipants;
};

/**
 * Calculates the total number of children across all groups
 */
export const calculateTotalChildCount = (tourGroups: VentrataTourGroup[]): number => {
  console.log("PARTICIPANTS DEBUG: calculateTotalChildCount called with", {
    tourGroupsCount: tourGroups.length,
    tourGroupsWithParticipants: tourGroups.filter(g => Array.isArray(g.participants) && g.participants.length > 0).length
  });
  
  // CRITICAL FIX: Only count from participants arrays, NEVER use childCount property
  let totalChildCount = 0;
  
  if (!Array.isArray(tourGroups)) {
    console.log("PARTICIPANTS DEBUG: tourGroups is not an array, returning 0");
    return 0;
  }
  
  // Process each group one by one
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupChildCount = 0;
      
      // Count directly from participants array
      for (const participant of group.participants) {
        const childCount = participant.childCount || 0;
        groupChildCount += childCount;
        
        console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}" childCount ${childCount} to total`);
      }
      
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" total children: ${groupChildCount}`);
      totalChildCount += groupChildCount;
    } else {
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants array or it's empty`);
    }
    // CRITICAL FIX: Completely remove fallback to group.childCount
  }
  
  console.log("PARTICIPANTS DEBUG: calculateTotalChildCount final result:", totalChildCount);
  return totalChildCount;
};

/**
 * Updates a participant's group assignment in the database
 */
export const updateParticipantGroupInDatabase = async (
  participantId: string,
  newGroupId: string
): Promise<boolean> => {
  try {
    console.log(`PARTICIPANTS DEBUG: Moving participant ${participantId} to group ${newGroupId}`);
    
    // First try the participants table
    const { error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId);
      
    if (error) {
      console.error("Error updating participant's group:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating participant group:", error);
    toast.error("Database error while updating participant group");
    return false;
  }
};

/**
 * Updates the calculated sizes on tour groups based on their participants
 */
export const syncTourGroupSizes = async (tourId: string): Promise<boolean> => {
  try {
    console.log(`PARTICIPANTS DEBUG: Syncing tour group sizes for tour ${tourId}`);
    
    // First get all groups for this tour
    const { data: tourGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, participants(id, count, child_count)')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("Error fetching tour groups for size sync:", groupsError);
      return false;
    }
    
    console.log(`PARTICIPANTS DEBUG: Fetched ${tourGroups.length} groups for size sync`);
    
    // Update each group's size and child_count based on participants
    for (const group of tourGroups) {
      if (!Array.isArray(group.participants)) {
        console.log(`PARTICIPANTS DEBUG: Group ${group.id} has no participants array, skipping`);
        continue;
      }
      
      let totalSize = 0;
      let totalChildCount = 0;
      
      // Calculate from participants
      for (const participant of group.participants) {
        totalSize += participant.count || 1;
        totalChildCount += participant.child_count || 0;
        
        console.log(`PARTICIPANTS DEBUG: Adding participant ${participant.id} with count ${participant.count || 1} and childCount ${participant.child_count || 0}`);
      }
      
      console.log(`PARTICIPANTS DEBUG: Updating group ${group.id} with size ${totalSize} and childCount ${totalChildCount}`);
      
      // Update the group with calculated values
      const { error: updateError } = await supabase
        .from('tour_groups')
        .update({
          size: totalSize,
          child_count: totalChildCount
        })
        .eq('id', group.id);
        
      if (updateError) {
        console.error(`Error updating size for group ${group.id}:`, updateError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error synchronizing tour group sizes:", error);
    return false;
  }
};

/**
 * Recalculates all group sizes for consistency
 */
export const recalculateAllTourGroupSizes = (tourGroups: VentrataTourGroup[]): VentrataTourGroup[] => {
  console.log("PARTICIPANTS DEBUG: recalculateAllTourGroupSizes called with", {
    tourGroupsCount: tourGroups.length
  });
  
  // Guard against invalid input
  if (!Array.isArray(tourGroups)) {
    console.log("PARTICIPANTS DEBUG: tourGroups is not an array, returning empty array");
    return [];
  }
  
  // Process each group
  return tourGroups.map(group => {
    // Create a copy to avoid mutating the original
    const updatedGroup = {...group};
    
    if (Array.isArray(updatedGroup.participants) && updatedGroup.participants.length > 0) {
      let calculatedSize = 0;
      let calculatedChildCount = 0;
      
      // Calculate from participants
      for (const participant of updatedGroup.participants) {
        calculatedSize += participant.count || 1;
        calculatedChildCount += participant.childCount || 0;
        
        console.log(`PARTICIPANTS DEBUG: Recalculating for participant "${participant.name}": count=${participant.count || 1}, childCount=${participant.childCount || 0}`);
      }
      
      // Update the size and childCount properties
      updatedGroup.size = calculatedSize;
      updatedGroup.childCount = calculatedChildCount;
      
      console.log(`PARTICIPANTS DEBUG: Group "${updatedGroup.name || 'Unnamed'}" recalculated: size=${calculatedSize}, childCount=${calculatedChildCount}`);
    } else {
      // If no participants, size should be 0
      updatedGroup.size = 0;
      updatedGroup.childCount = 0;
      
      console.log(`PARTICIPANTS DEBUG: Group "${updatedGroup.name || 'Unnamed'}" has no participants, setting size=0, childCount=0`);
    }
    
    return updatedGroup;
  });
};
