
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
  // CRITICAL FIX: Calculate total from participants arrays when available, fall back to size property
  const total = groups.reduce((total, group) => {
    // If we have a participants array, use that for the most accurate count
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return total + group.participants.reduce((sum, p) => sum + (p.count || 1), 0);
    }
    // Otherwise fall back to the group size property
    return total + (group.size || 0);
  }, 0);
  
  console.log("Calculated total participants with fixed counting:", total, "from groups:", 
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
  // CRITICAL FIX: Calculate from participants arrays when available, fall back to childCount property
  const totalChildren = groups.reduce((total, group) => {
    // If we have a participants array, use that for the most accurate count
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return total + group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0);
    }
    // Otherwise fall back to the group childCount property
    return total + (group.childCount || 0);
  }, 0);
  
  console.log("Calculated total child count with fixed counting:", totalChildren);
  
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
