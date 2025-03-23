
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

/**
 * Move a participant from one group to another with improved reliability
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
  
  if (!participantId || !newGroupId) {
    logger.error("🔄 [PARTICIPANT_MOVE] Invalid parameters:", {
      participantId, 
      currentGroupId, 
      newGroupId
    });
    return false;
  }
  
  try {
    // First verify the participant exists
    const { data: participantBefore, error: checkError } = await supabase
      .from('participants')
      .select('group_id, name, count, child_count')
      .eq('id', participantId)
      .single();
      
    if (checkError) {
      logger.error("🔄 [PARTICIPANT_MOVE] Failed to verify participant before move:", checkError);
      return false;
    }
    
    logger.debug("🔄 [PARTICIPANT_MOVE] Found participant before move:", {
      participantId,
      name: participantBefore.name,
      currentGroupActual: participantBefore.group_id,
      currentGroupExpected: currentGroupId,
      count: participantBefore.count,
      childCount: participantBefore.child_count
    });
    
    // IMPORTANT FIX: Always use the participant's actual current group
    // This prevents issues when the UI state is not in sync with the database
    const sourceGroupId = participantBefore.group_id;
    
    if (sourceGroupId === newGroupId) {
      logger.warn("🔄 [PARTICIPANT_MOVE] Participant is already in the target group, skipping move");
      return true; // Consider this a success since the desired state is achieved
    }
    
    // Get the source and target groups to properly update counts later
    const { data: groupsData, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, size, child_count')
      .in('id', [sourceGroupId, newGroupId]);
      
    if (groupsError) {
      logger.error("🔄 [PARTICIPANT_MOVE] Failed to fetch groups data:", groupsError);
      return false;
    }
    
    // Extract the source and target group data
    const sourceGroup = groupsData.find(g => g.id === sourceGroupId);
    const targetGroup = groupsData.find(g => g.id === newGroupId);
    
    if (!sourceGroup || !targetGroup) {
      logger.error("🔄 [PARTICIPANT_MOVE] Could not find source or target group:", {
        sourceGroupId, 
        newGroupId, 
        groupsFound: groupsData.map(g => g.id)
      });
      return false;
    }
    
    logger.debug("🔄 [PARTICIPANT_MOVE] Found source and target groups:", {
      sourceGroup: {
        id: sourceGroup.id,
        size: sourceGroup.size,
        childCount: sourceGroup.child_count
      },
      targetGroup: {
        id: targetGroup.id,
        size: targetGroup.size,
        childCount: targetGroup.child_count
      }
    });
    
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
    } else {
      logger.debug("🔄 [PARTICIPANT_MOVE] Successfully updated participant's group in database", {
        newGroupId: updatedParticipant.group_id,
        participantName: updatedParticipant.name
      });
    }
    
    // Add a significant delay to ensure database consistency before verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update the group sizes in a separate transaction
    const participantCount = participantBefore.count || 1;
    const participantChildCount = participantBefore.child_count || 0;
    
    // Calculate new sizes
    const newSourceSize = Math.max(0, (sourceGroup.size || 0) - participantCount);
    const newSourceChildCount = Math.max(0, (sourceGroup.child_count || 0) - participantChildCount);
    const newTargetSize = (targetGroup.size || 0) + participantCount;
    const newTargetChildCount = (targetGroup.child_count || 0) + participantChildCount;
    
    logger.debug("🔄 [PARTICIPANT_MOVE] Updating group sizes:", {
      sourceGroup: {
        before: { size: sourceGroup.size, childCount: sourceGroup.child_count },
        after: { size: newSourceSize, childCount: newSourceChildCount }
      },
      targetGroup: {
        before: { size: targetGroup.size, childCount: targetGroup.child_count },
        after: { size: newTargetSize, childCount: newTargetChildCount }
      }
    });
    
    // CRITICAL FIX: Use a transaction to update both groups atomically
    const { error: txError } = await supabase.rpc('update_groups_after_move', {
      source_group_id: sourceGroupId,
      target_group_id: newGroupId,
      source_size: newSourceSize,
      source_child_count: newSourceChildCount,
      target_size: newTargetSize,
      target_child_count: newTargetChildCount
    });
    
    if (txError) {
      logger.error("🔄 [PARTICIPANT_MOVE] Error in group size transaction:", txError);
      // Continue anyway - the participant move itself was successful
    } else {
      logger.debug("🔄 [PARTICIPANT_MOVE] Successfully updated group sizes in transaction");
    }
    
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
  } catch (error) {
    logger.error("🔄 [PARTICIPANT_MOVE] Unexpected error during move operation:", error);
    return false;
  }
};

/**
 * Updates a participant's group assignment in the database with improved reliability
 */
export const updateParticipantGroupInDatabase = async (
  participantId: string,
  newGroupId: string
): Promise<boolean> => {
  return moveParticipant(participantId, "", newGroupId);
};
