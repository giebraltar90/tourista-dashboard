
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates a participant's group assignment in the database
 */
export const updateParticipantGroupInDatabase = async (
  participantId: string,
  newGroupId: string
): Promise<boolean> => {
  try {
    console.log(`Updating participant ${participantId} to group ${newGroupId}`);
    
    const { error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId);
      
    if (error) {
      console.error("Error updating participant group:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating participant group:", error);
    return false;
  }
};

/**
 * Calculate total participants across all groups
 * This function accurately accounts for participants with count values
 */
export const calculateTotalParticipants = (groups: VentrataTourGroup[]): number => {
  if (!Array.isArray(groups) || groups.length === 0) {
    console.log("calculateTotalParticipants: No groups provided");
    return 0;
  }
  
  // BUGFIX: Count each actual participant for accurate totals
  let total = 0;
  
  for (const group of groups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Count directly from participants array
      for (const participant of group.participants) {
        total += participant.count || 1;
      }
      
      console.log(`BUGFIX: calculateTotalParticipants group ${group.name || 'unnamed'} direct calculation:`, {
        directTotal: group.participants.reduce((sum, p) => sum + (p.count || 1), 0),
        participantCount: group.participants.length
      });
    } else if (group.size) {
      // Only fallback to size properties when absolutely necessary
      console.log(`BUGFIX: calculateTotalParticipants no participants for group ${group.name || 'unnamed'}, using size:`, {
        size: group.size
      });
      
      total += group.size;
    }
  }
  
  console.log("BUGFIX: calculateTotalParticipants final total:", total);
  
  return total;
};

/**
 * Calculate total child participants across all groups
 */
export const calculateTotalChildCount = (groups: VentrataTourGroup[]): number => {
  if (!Array.isArray(groups) || groups.length === 0) {
    console.log("calculateTotalChildCount: No groups provided");
    return 0;
  }
  
  // BUGFIX: Count each actual child participant for accurate totals
  let totalChildren = 0;
  
  for (const group of groups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Count directly from participants array
      for (const participant of group.participants) {
        totalChildren += participant.childCount || 0;
      }
      
      console.log(`BUGFIX: calculateTotalChildCount group ${group.name || 'unnamed'} direct calculation:`, {
        directChildren: group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0),
        participantCount: group.participants.length
      });
    } else if (group.childCount) {
      // Only fallback to childCount property when absolutely necessary
      console.log(`BUGFIX: calculateTotalChildCount no participants for group ${group.name || 'unnamed'}, using childCount:`, {
        childCount: group.childCount
      });
      
      totalChildren += group.childCount;
    }
  }
  
  console.log("BUGFIX: calculateTotalChildCount final total:", totalChildren);
  
  return totalChildren;
};

/**
 * Get participant and group details by ID
 */
export const getParticipantById = async (
  participantId: string
): Promise<VentrataParticipant | null> => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();
      
    if (error || !data) {
      console.error("Error fetching participant:", error);
      return null;
    }
    
    // Map the database fields to the VentrataParticipant fields
    return {
      id: data.id,
      name: data.name,
      count: data.count || 1,
      bookingRef: data.booking_ref,
      childCount: data.child_count || 0,
      groupId: data.group_id,
      // Include snake_case properties for database compatibility
      booking_ref: data.booking_ref,
      group_id: data.group_id,
      child_count: data.child_count
    };
  } catch (error) {
    console.error("Error fetching participant:", error);
    return null;
  }
};

/**
 * Generate formatted participant count string (e.g. "8+2" for 8 adults and 2 children)
 */
export const formatParticipantCount = (totalCount: number, childCount: number): string => {
  if (childCount <= 0) {
    return `${totalCount}`;
  }
  const adultCount = totalCount - childCount;
  return `${adultCount}+${childCount}`;
};
