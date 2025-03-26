
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
    
    // First attempt with direct update
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
      
      // Try a second time with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { error: retryError } = await supabase
        .from("tour_groups")
        .update({ 
          guide_id: guideId,
          name: updatedName,
          updated_at: new Date().toISOString()
        })
        .eq("id", groupId);
        
      if (retryError) {
        logger.error("🔄 [AssignGuide] Retry also failed:", retryError);
        return false;
      }
    }
    
    logger.debug("🔄 [AssignGuide] Successfully updated guide assignment");
    return true;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Unexpected error in updateDatabase:", error);
    return false;
  }
};
