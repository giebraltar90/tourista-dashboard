
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Update guide assignment in the database with improved error handling for permission issues
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
    
    // Strategy 1: Direct update with no triggers
    try {
      const { error } = await supabase.rpc(
        'update_group_guide_no_triggers',
        {
          p_group_id: groupId,
          p_guide_id: guideId,
          p_name: updatedName
        }
      );
      
      if (!error) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide via RPC function");
        return true;
      }
      
      logger.debug("🔄 [AssignGuide] RPC function failed, trying alternative approach:", error);
    } catch (rpcError) {
      logger.debug("🔄 [AssignGuide] RPC function not available:", rpcError);
    }
    
    // Strategy 2: Standard update
    const { error } = await supabase
      .from("tour_groups")
      .update(updateData)
      .eq("id", groupId);
      
    if (!error) {
      logger.debug("🔄 [AssignGuide] Successfully updated guide with standard update");
      return true;
    }
    
    // If we get a permission error related to materialized view
    if (error.message.includes('materialized view')) {
      logger.debug("🔄 [AssignGuide] Permission error detected, trying alternative update approach");
      
      // Strategy 3: Raw update with select to avoid triggering the materialized view refresh
      const { error: rawError } = await supabase
        .from("tour_groups")
        .update(updateData)
        .eq("id", groupId)
        .select();
        
      if (!rawError) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide with raw update");
        return true;
      }
      
      logger.error("🔄 [AssignGuide] Raw update also failed:", rawError);
      
      // Strategy 4: Final attempt with simple insert
      try {
        // Get the tour_id for this group first
        const { data: groupData } = await supabase
          .from("tour_groups")
          .select("tour_id")
          .eq("id", groupId)
          .single();
          
        if (groupData?.tour_id) {
          // Try a direct upsert operation
          const { error: upsertError } = await supabase
            .from("tour_groups")
            .upsert({
              id: groupId,
              tour_id: groupData.tour_id,
              guide_id: guideId,
              name: updatedName,
              updated_at: new Date().toISOString()
            });
            
          if (!upsertError) {
            logger.debug("🔄 [AssignGuide] Successfully updated guide with upsert operation");
            return true;
          }
          
          logger.error("🔄 [AssignGuide] Upsert operation failed:", upsertError);
        }
      } catch (finalError) {
        logger.error("🔄 [AssignGuide] Final attempt failed:", finalError);
      }
    } else {
      // For other errors, try a second time with a delay
      logger.debug("🔄 [AssignGuide] Standard error, trying with delay:", error);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { error: retryError } = await supabase
        .from("tour_groups")
        .update(updateData)
        .eq("id", groupId);
        
      if (!retryError) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide with delayed retry");
        return true;
      }
      
      logger.error("🔄 [AssignGuide] Retry also failed:", retryError);
    }
    
    return false;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Unexpected error in updateDatabase:", error);
    return false;
  }
};
