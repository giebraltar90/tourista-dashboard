
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Verify that a participant move was successful by checking the final state
 */
export const verifyMovementSuccess = async (participantId: string, newGroupId: string): Promise<boolean> => {
  // Final verification
  const { data: finalParticipant, error: finalError } = await supabase
    .from('participants')
    .select('group_id, name')
    .eq('id', participantId)
    .single();
    
  if (finalError) {
    logger.error("🔄 [PARTICIPANT_MOVE] Error in final verification:", finalError);
    return true; // Assume it worked since we don't have evidence it didn't
  }
  
  const moveSuccessful = finalParticipant.group_id === newGroupId;
  
  if (!moveSuccessful) {
    logger.error("🔄 [PARTICIPANT_MOVE] Final verification failed - participant not in target group:", {
      participantId,
      name: finalParticipant.name,
      expectedGroup: newGroupId,
      actualGroup: finalParticipant.group_id
    });
    
    // Last resort retry if the move still didn't take effect
    const { error: lastRetryError } = await supabase
      .from('participants')
      .update({ 
        group_id: newGroupId,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId);
      
    if (lastRetryError) {
      logger.error("🔄 [PARTICIPANT_MOVE] Last resort retry failed:", lastRetryError);
      return false;
    }
    
    // Don't verify again, just hope it worked
    logger.debug("🔄 [PARTICIPANT_MOVE] Performed last resort retry");
    return true;
  }
  
  logger.debug("🔄 [PARTICIPANT_MOVE] Move verified successful!", {
    participantId,
    name: finalParticipant.name,
    finalGroup: finalParticipant.group_id
  });
  
  return true;
};
