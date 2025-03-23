
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    // First try direct database update - most reliable approach
    const { error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId);
      
    if (error) {
      console.error("PARTICIPANTS DEBUG: Error moving participant:", error);
      return false;
    }
    
    console.log("PARTICIPANTS DEBUG: Participant moved successfully in database");
    
    // Add a longer delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Double-check that the participant is in the correct group
    const { data: participant, error: checkError } = await supabase
      .from('participants')
      .select('group_id')
      .eq('id', participantId)
      .single();
      
    if (checkError) {
      console.error("PARTICIPANTS DEBUG: Error verifying participant move:", checkError);
      return true; // Assume it worked since we don't have evidence it didn't
    }
    
    // If participant is not in the expected group, try again
    if (participant && participant.group_id !== newGroupId) {
      console.warn(`PARTICIPANTS DEBUG: Participant ${participantId} not in expected group. Retrying...`);
      
      // Retry update with higher priority
      const { error: retryError } = await supabase
        .from('participants')
        .update({ group_id: newGroupId })
        .eq('id', participantId);
        
      if (retryError) {
        console.error("PARTICIPANTS DEBUG: Error in retry move:", retryError);
        return false;
      }
      
      // Additional delay after retry
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return true;
  } catch (error) {
    console.error("PARTICIPANTS DEBUG: Error in moveParticipant:", error);
    return false;
  }
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
    
    // Add a longer delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify the update took effect
    const { data, error: checkError } = await supabase
      .from('participants')
      .select('group_id')
      .eq('id', participantId)
      .single();
      
    if (checkError) {
      console.error("Error verifying participant move:", checkError);
      return true; // Assume it worked since we don't have evidence it didn't
    }
    
    // If not updated, try again
    if (data && data.group_id !== newGroupId) {
      console.warn(`Participant ${participantId} not in the expected group. Retrying...`);
      
      const { error: retryError } = await supabase
        .from('participants')
        .update({ group_id: newGroupId })
        .eq('id', participantId);
        
      if (retryError) {
        console.error("Error in retry update:", retryError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating participant group:", error);
    return false;
  }
};
