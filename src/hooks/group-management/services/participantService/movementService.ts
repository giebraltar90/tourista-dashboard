
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { EventEmitter } from "@/utils/eventEmitter";

/**
 * Move a participant from one group to another
 * Uses the database function for reliable atomic updates
 */
export const moveParticipant = async (
  participantId: string,
  fromGroupId: string,
  toGroupId: string
): Promise<boolean> => {
  try {
    logger.debug("🔄 [MOVE_PARTICIPANT] Starting movement operation", {
      participantId,
      fromGroupId,
      toGroupId
    });

    // Use the database RPC function for atomic updates
    const { data, error } = await supabase.rpc('move_participant', {
      p_participant_id: participantId,
      p_source_group_id: fromGroupId,
      p_target_group_id: toGroupId
    });

    if (error) {
      logger.error("🔄 [MOVE_PARTICIPANT] Database operation failed", error);
      return false;
    }

    // Success!
    logger.debug("🔄 [MOVE_PARTICIPANT] Successfully moved participant", {
      participantId,
      fromGroupId,
      toGroupId,
      result: data
    });

    // Emit participant change event to trigger UI updates
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
    // Use our new move_participant function which handles all the updates
    // We don't have the fromGroupId, so we pass null and let the function
    // fetch it from the database
    const { data, error } = await supabase.rpc('move_participant', {
      p_participant_id: participantId,
      p_source_group_id: null, // The DB function will find the current group
      p_target_group_id: newGroupId
    });

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
