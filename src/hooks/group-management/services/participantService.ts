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
  
  // CRITICAL FIX: Calculate total from participants arrays when available, fall back to size property
  const total = groups.reduce((total, group) => {
    // If we have a participants array, use that for the most accurate count
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      const participantsCount = group.participants.reduce((sum, p) => sum + (p.count || 1), 0);
      console.log(`Group ${group.name || 'unnamed'}: ${participantsCount} participants from array`);
      return total + participantsCount;
    }
    // Otherwise fall back to the group size property
    console.log(`Group ${group.name || 'unnamed'}: ${group.size || 0} participants from size property`);
    return total + (group.size || 0);
  }, 0);
  
  console.log("COUNTING: Total participants:", total, "from groups:", 
    groups.map(g => ({
      name: g.name,
      size: g.size,
      participantsArray: Array.isArray(g.participants) ? g.participants.length : 'N/A',
      participantsCount: Array.isArray(g.participants) 
        ? g.participants.reduce((sum, p) => sum + (p.count || 1), 0) 
        : 'N/A'
    }))
  );
  
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
  
  // CRITICAL FIX: Calculate from participants arrays when available, fall back to childCount property
  const totalChildren = groups.reduce((total, group) => {
    // If we have a participants array, use that for the most accurate count
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      const childCount = group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0);
      console.log(`Group ${group.name || 'unnamed'}: ${childCount} children from array`);
      return total + childCount;
    }
    // Otherwise fall back to the group childCount property
    console.log(`Group ${group.name || 'unnamed'}: ${group.childCount || 0} children from childCount property`);
    return total + (group.childCount || 0);
  }, 0);
  
  console.log("COUNTING: Total child count:", totalChildren);
  
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
