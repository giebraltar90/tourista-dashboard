
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Update a participant's group assignment
 */
export const updateParticipantGroup = async (participantId: string, newGroupId: string): Promise<boolean> => {
  // CRITICAL FIX: Use a more reliable update with return values to confirm changes
  const { data: updatedParticipant, error: updateError } = await supabase
    .from('participants')
    .update({ 
      group_id: newGroupId,
      updated_at: new Date().toISOString() // Force timestamp update to avoid caching issues
    })
    .eq('id', participantId)
    .select()
    .single();
    
  if (updateError) {
    logger.error("🔄 [PARTICIPANT_MOVE] Database error moving participant:", updateError);
    return false;
  }
  
  if (!updatedParticipant || updatedParticipant.group_id !== newGroupId) {
    logger.error("🔄 [PARTICIPANT_MOVE] Participant didn't update correctly:", {
      participant: updatedParticipant,
      expectedGroupId: newGroupId
    });
    
    // Attempt one more direct update as a fallback
    const { error: fallbackError } = await supabase
      .from('participants')
      .update({ 
        group_id: newGroupId,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId);
      
    if (fallbackError) {
      logger.error("🔄 [PARTICIPANT_MOVE] Fallback update failed:", fallbackError);
      return false;
    }
    
    logger.debug("🔄 [PARTICIPANT_MOVE] Fallback update attempted");
    return true;
  } else {
    logger.debug("🔄 [PARTICIPANT_MOVE] Successfully updated participant's group in database", {
      newGroupId: updatedParticipant.group_id,
      participantName: updatedParticipant.name
    });
    return true;
  }
};
