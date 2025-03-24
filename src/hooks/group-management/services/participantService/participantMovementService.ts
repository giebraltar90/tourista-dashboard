
import { VentrataParticipant } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Move a participant from one group to another
 */
export const moveParticipant = async (
  participant: VentrataParticipant,
  fromGroupId: string,
  toGroupId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!participant.id || !fromGroupId || !toGroupId) {
      return { success: false, error: "Missing required parameters" };
    }
    
    const { error } = await supabase.rpc('move_participant', {
      p_participant_id: participant.id,
      p_source_group_id: fromGroupId,
      p_target_group_id: toGroupId
    });
    
    if (error) {
      console.error("Error moving participant:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error moving participant:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Merge participants (not implemented)
 */
export const mergeParticipants = async (): Promise<{ success: boolean; error?: string }> => {
  toast.error("Merge participants function not implemented");
  return { success: false, error: "Not implemented" };
};
