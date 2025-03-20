
import { supabase } from "@/integrations/supabase/client";
import { VentrataParticipant } from "@/types/ventrata";

/**
 * Fetch participants for a specific tour
 */
export const fetchParticipantsForTour = async (tourId: string): Promise<VentrataParticipant[]> => {
  console.log(`Fetching participants for tour: ${tourId}`);
  
  try {
    // First get the tour groups for this tour
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("Error fetching tour groups:", groupsError);
      return [];
    }
    
    if (!groups || groups.length === 0) {
      console.log(`No groups found for tour ID: ${tourId}`);
      return [];
    }
    
    // Get group IDs
    const groupIds = groups.map(group => group.id);
    
    // Fetch participants for these groups
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .in('group_id', groupIds);
      
    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      return [];
    }
    
    if (!participants || participants.length === 0) {
      console.log(`No participants found for tour ID: ${tourId}`);
      return [];
    }
    
    // Transform the data to match our VentrataParticipant type
    return participants.map(p => ({
      id: p.id,
      name: p.name,
      count: p.count || 1,
      bookingRef: p.booking_ref,
      childCount: p.child_count || 0,
      group_id: p.group_id
    }));
  } catch (error) {
    console.error(`Error in fetchParticipantsForTour for tour ${tourId}:`, error);
    return [];
  }
};

/**
 * Update participant's group assignment
 */
export const updateParticipant = async (participantId: string, newGroupId: string): Promise<boolean> => {
  console.log(`Updating participant ${participantId} to group ${newGroupId}`);
  
  try {
    const { error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId);
      
    if (error) {
      console.error(`Error updating participant ${participantId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in updateParticipant:`, error);
    return false;
  }
};

/**
 * Update tour groups (implementation)
 */
export const updateTourGroups = async (tourId: string, updatedGroups: any[]): Promise<boolean> => {
  console.log(`Updating tour groups for tour: ${tourId}`, updatedGroups);
  
  try {
    // Update each group individually
    for (const group of updatedGroups) {
      const { error } = await supabase
        .from('tour_groups')
        .update({
          name: group.name,
          size: group.size,
          entry_time: group.entryTime,
          guide_id: group.guideId,
          child_count: group.childCount
        })
        .eq('id', group.id);
        
      if (error) {
        console.error(`Error updating tour group ${group.id}:`, error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error in updateTourGroups for tour ${tourId}:`, error);
    return false;
  }
};
