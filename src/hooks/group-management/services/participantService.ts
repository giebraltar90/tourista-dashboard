
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
  
  // ULTRA BUGFIX: Count each actual participant for accurate totals with detailed logging
  let total = 0;
  
  console.log("ULTRA DEBUG: calculateTotalParticipants starting with groups:", {
    groupsCount: groups.length,
    groupDetails: groups.map(g => ({
      id: g.id,
      name: g.name,
      size: g.size,
      hasParticipants: Array.isArray(g.participants),
      participantsCount: Array.isArray(g.participants) ? g.participants.length : 0
    }))
  });
  
  for (const group of groups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      
      // Detailed logging of each participant
      console.log(`ULTRA DEBUG: Group "${group.name}" participant details:`, 
        group.participants.map(p => ({ 
          name: p.name, 
          count: p.count, 
          childCount: p.childCount 
        }))
      );
      
      // Count directly from participants array - one by one
      for (const participant of group.participants) {
        const count = participant.count || 1;
        groupTotal += count;
        
        console.log(`ULTRA DEBUG: Adding participant "${participant.name}": count=${count}`);
      }
      
      total += groupTotal;
      
      console.log(`ULTRA DEBUG: calculateTotalParticipants group "${group.name || 'unnamed'}" final calculation:`, {
        groupId: group.id,
        groupName: group.name,
        groupParticipantCount: group.participants.length,
        groupTotal
      });
    } else if (group.size) {
      // Only fallback to size properties when absolutely necessary
      console.log(`ULTRA DEBUG: calculateTotalParticipants no participants for group ${group.name || 'unnamed'}, using size:`, {
        size: group.size
      });
      
      total += group.size;
    }
  }
  
  console.log("ULTRA DEBUG: calculateTotalParticipants final total:", total);
  
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
  
  // ULTRA BUGFIX: Count each actual child participant for accurate totals
  let totalChildren = 0;
  
  console.log("ULTRA DEBUG: calculateTotalChildCount starting with groups:", {
    groupsCount: groups.length,
    groupDetails: groups.map(g => ({
      id: g.id,
      name: g.name,
      childCount: g.childCount,
      hasParticipants: Array.isArray(g.participants),
      participantsCount: Array.isArray(g.participants) ? g.participants.length : 0
    }))
  });
  
  for (const group of groups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupChildCount = 0;
      
      // Detailed logging of each participant's child count
      console.log(`ULTRA DEBUG: Group "${group.name}" child count details:`, 
        group.participants.map(p => ({ 
          name: p.name, 
          childCount: p.childCount || 0
        }))
      );
      
      // Count directly from participants array - one by one
      for (const participant of group.participants) {
        const childCount = participant.childCount || 0;
        groupChildCount += childCount;
        
        console.log(`ULTRA DEBUG: Adding children for "${participant.name}": childCount=${childCount}`);
      }
      
      totalChildren += groupChildCount;
      
      console.log(`ULTRA DEBUG: calculateTotalChildCount group "${group.name || 'unnamed'}" final calculation:`, {
        groupId: group.id,
        groupName: group.name,
        groupParticipantCount: group.participants.length,
        groupChildCount
      });
    } else if (group.childCount) {
      // Only fallback to childCount property when absolutely necessary
      console.log(`ULTRA DEBUG: calculateTotalChildCount no participants for group ${group.name || 'unnamed'}, using childCount:`, {
        childCount: group.childCount
      });
      
      totalChildren += group.childCount;
    }
  }
  
  console.log("ULTRA DEBUG: calculateTotalChildCount final total:", totalChildren);
  
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
