
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Update the database with the guide assignment
 */
export const updateDatabaseWithGuideAssignment = async (
  groupId: string,
  guideId: string | null,
  updatedName: string
): Promise<boolean> => {
  try {
    // Update the group with the new guide ID and name
    const { error: updateError } = await supabase
      .from('tour_groups')
      .update({
        guide_id: guideId,
        name: updatedName,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId);

    if (updateError) {
      logger.error("🔄 [AssignGuide] Error updating group:", updateError);
      return false;
    }

    logger.log(`🔄 [AssignGuide] Successfully updated group ${groupId} with guide ${guideId || 'none'}`);
    return true;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Exception in updateDatabaseWithGuideAssignment:", error);
    return false;
  }
};
