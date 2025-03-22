
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
    const { data, error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId)
      .select();
      
    if (error) {
      console.error("PARTICIPANTS DEBUG: Error moving participant:", error);
      toast.error("Failed to move participant");
      return false;
    }
    
    console.log("PARTICIPANTS DEBUG: Participant moved successfully:", data);
    toast.success("Participant moved successfully");
    return true;
  } catch (error) {
    console.error("PARTICIPANTS DEBUG: Error in moveParticipant:", error);
    toast.error("Error moving participant");
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
    
    return true;
  } catch (error) {
    console.error("Error updating participant group:", error);
    toast.error("Database error while updating participant group");
    return false;
  }
};
