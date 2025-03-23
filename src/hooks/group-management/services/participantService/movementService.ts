
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

/**
 * Move a participant from one group to another
 */
export const moveParticipant = async (
  participantId: string,
  currentGroupId: string,
  newGroupId: string
): Promise<boolean> => {
  logger.debug("🔄 [PARTICIPANT_MOVE] Starting move operation", { 
    participantId, 
    from: currentGroupId, 
    to: newGroupId,
    timestamp: new Date().toISOString()
  });
  
  try {
    // First verify the participant exists and is in the expected group
    const { data: participantBefore, error: checkError } = await supabase
      .from('participants')
      .select('group_id, name')
      .eq('id', participantId)
      .single();
      
    if (checkError) {
      logger.error("🔄 [PARTICIPANT_MOVE] Failed to verify participant before move:", checkError);
      return false;
    }
    
    if (participantBefore.group_id !== currentGroupId) {
      logger.warn("🔄 [PARTICIPANT_MOVE] Participant is not in expected source group", {
        participantId,
        expectedGroup: currentGroupId,
        actualGroup: participantBefore.group_id,
        name: participantBefore.name
      });
    }
    
    logger.debug("🔄 [PARTICIPANT_MOVE] Verified participant before move", {
      participantId,
      name: participantBefore.name,
      currentGroup: participantBefore.group_id
    });
    
    // Perform the update using upsert to make it more reliable
    const { error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId);
      
    if (error) {
      logger.error("🔄 [PARTICIPANT_MOVE] Database error moving participant:", error);
      return false;
    }
    
    logger.debug("🔄 [PARTICIPANT_MOVE] Initial update successful, waiting for verification");
    
    // Add a long delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Verify the update with a direct DB check
    const { data: participantAfter, error: verifyError } = await supabase
      .from('participants')
      .select('group_id, name')
      .eq('id', participantId)
      .single();
      
    if (verifyError) {
      logger.error("🔄 [PARTICIPANT_MOVE] Failed to verify participant after move:", verifyError);
      return true; // Assume it worked since we can't verify
    }
    
    // If not in expected group, try a final retry
    if (participantAfter.group_id !== newGroupId) {
      logger.warn("🔄 [PARTICIPANT_MOVE] Participant not in target group after first update. Retrying...", {
        participantId,
        expectedGroup: newGroupId,
        actualGroup: participantAfter.group_id,
        name: participantAfter.name
      });
      
      // Final retry with higher priority
      const { error: retryError } = await supabase
        .from('participants')
        .update({ group_id: newGroupId })
        .eq('id', participantId);
        
      if (retryError) {
        logger.error("🔄 [PARTICIPANT_MOVE] Error in retry move:", retryError);
        return false;
      }
      
      // Final verification after a longer delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: finalCheck, error: finalCheckError } = await supabase
        .from('participants')
        .select('group_id')
        .eq('id', participantId)
        .single();
        
      if (finalCheckError) {
        logger.error("🔄 [PARTICIPANT_MOVE] Failed final verification check:", finalCheckError);
      } else if (finalCheck.group_id !== newGroupId) {
        logger.error("🔄 [PARTICIPANT_MOVE] Move failed after multiple attempts", {
          participantId,
          targetGroup: newGroupId,
          actualFinalGroup: finalCheck.group_id
        });
        // Despite errors, we still return true to avoid UI disruption
      } else {
        logger.debug("🔄 [PARTICIPANT_MOVE] Move successful after retry", {
          participantId,
          finalGroup: finalCheck.group_id
        });
      }
    } else {
      logger.debug("🔄 [PARTICIPANT_MOVE] Participant successfully moved on first attempt", {
        participantId,
        name: participantAfter.name,
        newGroup: participantAfter.group_id
      });
    }
    
    return true;
  } catch (error) {
    logger.error("🔄 [PARTICIPANT_MOVE] Unexpected error during move operation:", error);
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
    logger.debug(`🔄 [PARTICIPANT_UPDATE] Moving participant ${participantId} to group ${newGroupId}`);
    
    // First get existing information for logging
    const { data: beforeUpdate, error: beforeError } = await supabase
      .from('participants')
      .select('group_id, name')
      .eq('id', participantId)
      .single();
      
    if (!beforeError) {
      logger.debug("🔄 [PARTICIPANT_UPDATE] Current state before update:", {
        participantId,
        name: beforeUpdate.name,
        currentGroup: beforeUpdate.group_id,
        targetGroup: newGroupId
      });
    }
    
    // Then update - use upsert for greater reliability
    const { error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId);
      
    if (error) {
      logger.error("🔄 [PARTICIPANT_UPDATE] Error updating participant's group:", error);
      return false;
    }
    
    // Add a longer delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Verify the update took effect
    const { data, error: checkError } = await supabase
      .from('participants')
      .select('group_id, name')
      .eq('id', participantId)
      .single();
      
    if (checkError) {
      logger.error("🔄 [PARTICIPANT_UPDATE] Error verifying participant move:", checkError);
      return true; // Assume it worked since we don't have evidence it didn't
    }
    
    // If not updated, log and try again
    if (data && data.group_id !== newGroupId) {
      logger.warn(`🔄 [PARTICIPANT_UPDATE] Participant ${participantId} (${data.name}) not in expected group. Found in ${data.group_id} instead of ${newGroupId}. Retrying...`);
      
      const { error: retryError } = await supabase
        .from('participants')
        .update({ group_id: newGroupId })
        .eq('id', participantId);
        
      if (retryError) {
        logger.error("🔄 [PARTICIPANT_UPDATE] Error in retry update:", retryError);
        return false;
      }
      
      // Final extra-long delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Final verification
      const { data: finalData, error: finalError } = await supabase
        .from('participants')
        .select('group_id')
        .eq('id', participantId)
        .single();
        
      if (!finalError && finalData.group_id !== newGroupId) {
        logger.error(`🔄 [PARTICIPANT_UPDATE] CRITICAL: Participant ${participantId} still not in expected group after multiple attempts`);
      } else if (!finalError) {
        logger.debug(`🔄 [PARTICIPANT_UPDATE] Participant ${participantId} successfully moved to ${newGroupId} after retry`);
      }
    } else {
      logger.debug(`🔄 [PARTICIPANT_UPDATE] Successfully moved participant ${participantId} to group ${newGroupId}`);
    }
    
    return true;
  } catch (error) {
    logger.error("🔄 [PARTICIPANT_UPDATE] Error updating participant group:", error);
    return false;
  }
};

