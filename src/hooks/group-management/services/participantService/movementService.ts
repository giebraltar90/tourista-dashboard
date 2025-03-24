
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { VentrataParticipant } from "@/types/ventrata";
import { EventEmitter } from "@/utils/eventEmitter";

/**
 * Move a participant from one group to another
 */
export const moveParticipant = async (
  participantId: string,  // Accept participant ID as string
  fromGroupId: string,
  toGroupId: string
): Promise<boolean> => {
  try {
    logger.debug("🔄 [MOVE_PARTICIPANT] Starting movement operation", {
      participantId,
      fromGroupId,
      toGroupId
    });

    // Verify participant exists in the source group
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .eq('group_id', fromGroupId)
      .single();

    if (fetchError || !participant) {
      logger.error("🔄 [MOVE_PARTICIPANT] Participant not found or not in source group", {
        participantId,
        fromGroupId,
        error: fetchError
      });
      return false;
    }

    // Update the participant with the new group_id
    const { error: updateError } = await supabase
      .from('participants')
      .update({ group_id: toGroupId })
      .eq('id', participantId);

    if (updateError) {
      logger.error("🔄 [MOVE_PARTICIPANT] Failed to update participant group", updateError);
      return false;
    }

    // Success!
    logger.debug("🔄 [MOVE_PARTICIPANT] Successfully moved participant", {
      participantId,
      fromGroupId,
      toGroupId
    });

    // Emit participant change event to trigger recalculations
    EventEmitter.emit('participant-moved', {
      participantId,
      fromGroupId,
      toGroupId
    });

    return true;
  } catch (error) {
    logger.error("🔄 [MOVE_PARTICIPANT] Exception in moveParticipant:", error);
    return false;
  }
};

/**
 * Update participant's group in the database
 * Legacy function - kept for compatibility
 */
export const updateParticipantGroupInDatabase = async (
  participantId: string,
  newGroupId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId);

    if (error) {
      logger.error("🔄 [UPDATE_PARTICIPANT_GROUP] Error updating participant group:", error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error("🔄 [UPDATE_PARTICIPANT_GROUP] Exception in updateParticipantGroupInDatabase:", error);
    return false;
  }
};
