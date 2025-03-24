
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Update guide assignment in the database
 */
export const updateDatabase = async (
  groupId: string, 
  guideId: string | null, 
  updatedName: string
): Promise<boolean> => {
  try {
    logger.debug("🔄 [AssignGuide] Updating database:", { 
      groupId, 
      guideId: guideId || 'null', 
      updatedName 
    });
    
    const { error } = await supabase
      .from("tour_groups")
      .update({ 
        guide_id: guideId,
        name: updatedName,
        updated_at: new Date().toISOString()
      })
      .eq("id", groupId);
      
    if (error) {
      logger.error("🔄 [AssignGuide] Error updating group:", error);
      return false;
    }
    
    logger.debug("🔄 [AssignGuide] Successfully updated guide assignment");
    return true;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Unexpected error in updateDatabase:", error);
    return false;
  }
};
