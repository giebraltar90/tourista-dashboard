
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";

/**
 * Transforms database participant data into VentrataParticipant format
 */
export const transformParticipantData = (participant: any): VentrataParticipant => {
  return {
    id: participant.id,
    name: participant.name,
    count: participant.count || 1,
    bookingRef: participant.booking_ref,
    childCount: participant.child_count || 0,
    groupId: participant.group_id,
    group_id: participant.group_id,
    booking_ref: participant.booking_ref,
    child_count: participant.child_count || 0,
    created_at: participant.created_at,
    updated_at: participant.updated_at
  };
};

/**
 * Creates tour groups with their participant data
 */
export const createGroupsWithParticipants = (
  groups: any[], 
  participants: any[]
): VentrataTourGroup[] => {
  return groups.map(group => {
    // Get participants for this group
    const groupParticipants = participants
      ? participants
          .filter(p => p.group_id === group.id)
          .map(transformParticipantData)
      : [];
      
    console.log(`DATABASE DEBUG: Group ${group.id} (${group.name || 'Unnamed'}) has ${groupParticipants.length} participants`);
    
    if (groupParticipants.length > 0) {
      console.log(`DATABASE DEBUG: First participant in group ${group.name || 'Unnamed'}:`, 
        JSON.stringify(groupParticipants[0], null, 2));
    }
      
    // Calculate size and childCount from participants
    const size = groupParticipants.reduce((total, p) => total + (p.count || 1), 0);
    const childCount = groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0);
    
    console.log(`DATABASE DEBUG: Group ${group.id} (${group.name || 'Unnamed'}) processed:`, {
      participants: groupParticipants.length,
      calculatedSize: size,
      databaseSize: group.size
    });
    
    // If group has a size but no participants, we'll use the database size
    const finalSize = groupParticipants.length > 0 ? size : (group.size || 0);
    const finalChildCount = groupParticipants.length > 0 ? childCount : (group.child_count || 0);
    
    return {
      id: group.id,
      name: group.name,
      guideId: group.guide_id,
      entryTime: group.entry_time || "9:00", // Default entry time if not provided
      size: finalSize,
      childCount: finalChildCount,
      participants: groupParticipants
    };
  });
};

/**
 * Log data about groups with participants
 */
export const logGroupsWithParticipants = (groups: VentrataTourGroup[]) => {
  console.log("DATABASE DEBUG: Final groups with participants:", 
    groups.map(g => ({
      id: g.id,
      name: g.name || 'Unnamed',
      entryTime: g.entryTime,
      size: g.size,
      childCount: g.childCount,
      participantsCount: g.participants?.length || 0
    }))
  );
};
