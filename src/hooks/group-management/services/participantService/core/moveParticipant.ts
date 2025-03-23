
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { verifyParticipant } from "./verifyParticipant";
import { fetchGroupData } from "./fetchGroupData";
import { updateParticipantGroup } from "./updateParticipantGroup";
import { updateGroupSizes } from "./updateGroupSizes";
import { verifyMovementSuccess } from "./verifyMovementSuccess";

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
    // Step 1: Verify participant exists and get current data
    const participantBefore = await verifyParticipant(participantId);
    if (!participantBefore) {
      logger.error("🔄 [PARTICIPANT_MOVE] Participant not found:", { participantId });
      toast.error("Participant not found. Please refresh and try again.");
      return false;
    }
    
    // IMPORTANT FIX: Always use the participant's actual current group
    // This prevents issues when the UI state is not in sync with the database
    const sourceGroupId = participantBefore.group_id;
    
    if (sourceGroupId === newGroupId) {
      logger.warn("🔄 [PARTICIPANT_MOVE] Participant is already in the target group, skipping move");
      return true; // Consider this a success since the desired state is achieved
    }
    
    // Step 2: Get both source and target group data
    const { sourceGroup, targetGroup } = await fetchGroupData(sourceGroupId, newGroupId);
    if (!sourceGroup || !targetGroup) {
      logger.error("🔄 [PARTICIPANT_MOVE] Could not find source or target group", {
        sourceGroupId,
        newGroupId
      });
      toast.error("Group not found. Please refresh and try again.");
      return false;
    }
    
    // Step 3: Update the participant's group assignment
    const moveSuccess = await updateParticipantGroup(participantId, newGroupId);
    if (!moveSuccess) {
      logger.error("🔄 [PARTICIPANT_MOVE] Failed to update participant's group", {
        participantId,
        newGroupId
      });
      toast.error("Failed to move participant. Please try again.");
      return false;
    }
    
    // Step 4: Update group sizes
    const participantCount = participantBefore.count || 1;
    const participantChildCount = participantBefore.child_count || 0;
    
    await updateGroupSizes(
      sourceGroupId, 
      newGroupId, 
      sourceGroup, 
      targetGroup, 
      participantCount, 
      participantChildCount
    );
    
    // Step 5: Verify the move was successful
    const finalResult = await verifyMovementSuccess(participantId, newGroupId);
    
    if (finalResult) {
      logger.debug("🔄 [PARTICIPANT_MOVE] Successfully moved participant", {
        participantId,
        from: sourceGroupId,
        to: newGroupId
      });
    }
    
    return finalResult;
  } catch (error) {
    logger.error("🔄 [PARTICIPANT_MOVE] Unexpected error during move operation:", error);
    toast.error("An unexpected error occurred while moving the participant.");
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
