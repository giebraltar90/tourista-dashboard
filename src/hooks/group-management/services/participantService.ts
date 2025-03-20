
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Calculates the total number of participants across all groups
 */
export const calculateTotalParticipants = (tourGroups: VentrataTourGroup[]): number => {
  // CRITICAL FIX: Only count from participants arrays, NEVER use size property
  let totalParticipants = 0;
  
  // First try to count from participants array
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Count directly from participants array for accurate totals
      for (const participant of group.participants) {
        totalParticipants += participant.count || 1;
      }
    }
    // CRITICAL FIX: Completely remove fallback to group.size
  }
  
  console.log("ULTRACHECK PARTICIPANTS: calculateTotalParticipants result:", totalParticipants);
  return totalParticipants;
};

/**
 * Calculates the total number of children across all groups
 */
export const calculateTotalChildCount = (tourGroups: VentrataTourGroup[]): number => {
  // CRITICAL FIX: Only count from participants arrays, NEVER use childCount property
  let totalChildCount = 0;
  
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Count directly from participants array
      for (const participant of group.participants) {
        totalChildCount += participant.childCount || 0;
      }
    }
    // CRITICAL FIX: Completely remove fallback to group.childCount
  }
  
  console.log("ULTRACHECK PARTICIPANTS: calculateTotalChildCount result:", totalChildCount);
  return totalChildCount;
};

/**
 * Formats participant count as "adults+children" if there are children
 */
export const formatParticipantCount = (totalParticipants: number, childCount: number): string => {
  if (childCount > 0) {
    const adultCount = totalParticipants - childCount;
    return `${adultCount}+${childCount}`;
  }
  return `${totalParticipants}`;
};

/**
 * Updates a participant's group assignment in the database
 */
export const updateParticipantGroupInDatabase = async (
  participantId: string,
  newGroupId: string
): Promise<boolean> => {
  try {
    console.log(`Moving participant ${participantId} to group ${newGroupId}`);
    
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
    // First get all groups for this tour
    const { data: tourGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, participants(id, count, child_count)')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("Error fetching tour groups for size sync:", groupsError);
      return false;
    }
    
    // Update each group's size and child_count based on participants
    for (const group of tourGroups) {
      if (!Array.isArray(group.participants)) {
        continue;
      }
      
      let totalSize = 0;
      let totalChildCount = 0;
      
      // Calculate from participants
      for (const participant of group.participants) {
        totalSize += participant.count || 1;
        totalChildCount += participant.child_count || 0;
      }
      
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
      }
      
      // Update the size and childCount properties
      updatedGroup.size = calculatedSize;
      updatedGroup.childCount = calculatedChildCount;
    } else {
      // If no participants, size should be 0
      updatedGroup.size = 0;
      updatedGroup.childCount = 0;
    }
    
    return updatedGroup;
  });
};
