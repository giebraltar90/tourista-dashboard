
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Verify if a participant exists and return their data
 */
export const verifyParticipant = async (participantId: string) => {
  const { data: participant, error: checkError } = await supabase
    .from('participants')
    .select('group_id, name, count, child_count')
    .eq('id', participantId)
    .single();
    
  if (checkError) {
    logger.error("🔄 [PARTICIPANT_MOVE] Failed to verify participant before move:", checkError);
    return null;
  }
  
  logger.debug("🔄 [PARTICIPANT_MOVE] Found participant before move:", {
    participantId,
    name: participant.name,
    currentGroupActual: participant.group_id,
    count: participant.count,
    childCount: participant.child_count
  });
  
  return participant;
};
