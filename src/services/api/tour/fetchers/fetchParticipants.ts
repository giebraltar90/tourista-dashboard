
import { supabase } from "@/integrations/supabase/client";
import { SupabaseParticipant } from "./types";

/**
 * Fetch participants for tour groups
 */
export const fetchParticipantsForGroups = async (groupIds: string[]): Promise<SupabaseParticipant[]> => {
  // Guard against empty group IDs array
  if (!groupIds.length) {
    console.log("DATABASE DEBUG: No group IDs provided for fetching participants");
    return [];
  }
  
  console.log(`DATABASE DEBUG: Fetching participants for ${groupIds.length} groups:`, groupIds);
  
  try {
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .in('group_id', groupIds);
      
    if (participantsError) {
      console.error("DATABASE DEBUG: Error fetching participants:", participantsError);
      return [];
    }
    
    const participants = participantsData || [];
    console.log(`DATABASE DEBUG: Fetched ${participants.length} participants for ${groupIds.length} groups`);
    
    // Log distribution of participants across groups
    const participantsByGroup = {};
    for (const p of participants) {
      if (!participantsByGroup[p.group_id]) {
        participantsByGroup[p.group_id] = [];
      }
      participantsByGroup[p.group_id].push(p);
    }
    
    for (const groupId in participantsByGroup) {
      console.log(`DATABASE DEBUG: Group ${groupId} has ${participantsByGroup[groupId].length} participants`);
    }
    
    return participants;
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchParticipantsForGroups:", error);
    return [];
  }
};
