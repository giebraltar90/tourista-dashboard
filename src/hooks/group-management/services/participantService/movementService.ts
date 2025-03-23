
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
    
    // Add a delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    
    // Add a delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return true;
  } catch (error) {
    console.error("Error updating participant group:", error);
    return false;
  }
};
