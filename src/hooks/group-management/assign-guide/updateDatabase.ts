
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
    
    // Prepare update data
    const updateData = { 
      guide_id: guideId,
      name: updatedName,
      updated_at: new Date().toISOString()
    };
    
    // First attempt - simple update without refreshing materialized views
    const { error } = await supabase
      .from("tour_groups")
      .update(updateData)
      .eq("id", groupId);
      
    if (error) {
      logger.error("🔄 [AssignGuide] Error updating group:", error);
      
      // If the error is related to materialized view permissions, try a different approach
      if (error.message.includes('materialized view')) {
        logger.debug("🔄 [AssignGuide] Permission error detected, trying alternative update approach");
        
        // Alternative approach that skips materialized view refresh
        const { error: alternativeError } = await supabase.rpc(
          'update_tour_group_without_refresh',
          {
            p_group_id: groupId,
            p_guide_id: guideId,
            p_name: updatedName
          }
        );
        
        if (alternativeError) {
          // If the RPC function doesn't exist yet, fall back to a raw update with no triggers
          logger.debug("🔄 [AssignGuide] RPC not available, trying raw update");
          
          const { error: rawError } = await supabase
            .from("tour_groups")
            .update(updateData)
            .eq("id", groupId)
            .select();
            
          if (rawError) {
            logger.error("🔄 [AssignGuide] Raw update also failed:", rawError);
            return false;
          }
        }
      } else {
        // For other errors, try a second time with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: retryError } = await supabase
          .from("tour_groups")
          .update(updateData)
          .eq("id", groupId);
          
        if (retryError) {
          logger.error("🔄 [AssignGuide] Retry also failed:", retryError);
          return false;
        }
      }
    }
    
    logger.debug("🔄 [AssignGuide] Successfully updated guide assignment");
    return true;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Unexpected error in updateDatabase:", error);
    return false;
  }
};
