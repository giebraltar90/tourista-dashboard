
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetch participants for tour groups
 */
export const fetchParticipantsForGroups = async (groupIds: string[]) => {
  try {
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .in('group_id', groupIds);
      
    if (participantsError) {
      console.error("DATABASE DEBUG: Error fetching participants:", participantsError);
      console.log("DATABASE DEBUG: SQL error details:", participantsError.details, participantsError.message);
      return { success: false, error: participantsError.message };
    }
    
    console.log(`DATABASE DEBUG: Found ${participantsData ? participantsData.length : 0} total participants`);
    return { success: true, participants: participantsData || [] };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchParticipantsForGroups:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Create test participants for groups with no participants
 */
export const createTestParticipants = async (groups: any[]) => {
  try {
    console.log("DATABASE DEBUG: Attempting to create test participants...");
    
    const createdParticipants = [];
    
    // Insert one test participant per group
    for (const group of groups) {
      const { data: insertResult, error: insertError } = await supabase
        .from('participants')
        .insert({
          name: `Test Participant for ${group.name || 'Group'}`,
          count: 2,
          child_count: 1,
          group_id: group.id,
          booking_ref: 'TEST-123'
        })
        .select();
        
      if (insertError) {
        console.error(`DATABASE DEBUG: Error inserting test participant for group ${group.id}:`, insertError);
      } else {
        console.log(`DATABASE DEBUG: Successfully created test participant for group ${group.id}:`, insertResult);
        if (insertResult) {
          createdParticipants.push(...insertResult);
        }
      }
    }
    
    return { success: createdParticipants.length > 0, participants: createdParticipants };
  } catch (error) {
    console.error("DATABASE DEBUG: Exception when inserting test participants:", error);
    return { success: false, error: String(error) };
  }
};
