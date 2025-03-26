
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Update guide assignment in the database with improved persistence strategies
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
    
    // Strategy 1: Use the new assign_guide_safely function
    try {
      const { error } = await supabase.rpc(
        'assign_guide_safely',
        {
          p_group_id: groupId,
          p_guide_id: guideId,
          p_group_name: updatedName
        }
      );
      
      if (!error) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide via assign_guide_safely RPC function");
        return true;
      }
      
      logger.debug("🔄 [AssignGuide] assign_guide_safely function failed, trying alternative approach:", error);
    } catch (rpcError) {
      logger.debug("🔄 [AssignGuide] assign_guide_safely function not available:", rpcError);
    }
    
    // Strategy 2: Use the update_group_guide_no_triggers function
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
        logger.debug("🔄 [AssignGuide] Successfully updated guide via update_group_guide_no_triggers function");
        return true;
      }
      
      logger.debug("🔄 [AssignGuide] update_group_guide_no_triggers function failed, trying alternative approach:", error);
    } catch (rpcError) {
      logger.debug("🔄 [AssignGuide] update_group_guide_no_triggers function not available:", rpcError);
    }
    
    // Strategy 3: Use the safe_update_tour_group function with all fields
    try {
      // First fetch the current group data to preserve other fields
      const { data: groupData, error: fetchError } = await supabase
        .from("tour_groups")
        .select("size, entry_time, child_count")
        .eq("id", groupId)
        .single();
        
      if (fetchError) {
        logger.error("🔄 [AssignGuide] Error fetching group data:", fetchError);
      } else if (groupData) {
        // Use the safe update function with all fields
        const { error: safeUpdateError } = await supabase.rpc(
          'safe_update_tour_group',
          {
            p_id: groupId,
            p_name: updatedName,
            p_size: groupData.size || 0,
            p_guide_id: guideId,
            p_entry_time: groupData.entry_time || '00:00',
            p_child_count: groupData.child_count || 0
          }
        );
        
        if (!safeUpdateError) {
          logger.debug("🔄 [AssignGuide] Successfully updated guide via safe_update_tour_group function");
          return true;
        }
        
        logger.debug("🔄 [AssignGuide] safe_update_tour_group function failed:", safeUpdateError);
      }
    } catch (safeUpdateError) {
      logger.debug("🔄 [AssignGuide] safe_update_tour_group function not available:", safeUpdateError);
    }
    
    // Strategy 4: Fix permissions before attempting standard update
    try {
      await supabase.rpc('fix_materialized_view_permissions');
      logger.debug("🔄 [AssignGuide] Attempted to fix materialized view permissions");
    } catch (error) {
      logger.debug("🔄 [AssignGuide] Could not fix materialized view permissions:", error);
    }
    
    // Strategy 5: Standard update with retry mechanism
    const updateData = { 
      guide_id: guideId,
      name: updatedName,
      updated_at: new Date().toISOString()
    };
    
    // Attempt standard update with retries
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase
        .from("tour_groups")
        .update(updateData)
        .eq("id", groupId);
        
      if (!error) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide with standard update (attempt " + (attempt+1) + ")");
        return true;
      }
      
      logger.debug(`🔄 [AssignGuide] Standard update failed (attempt ${attempt+1}):`, error);
      
      // Small delay before retry
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
    
    // Strategy 6: Direct database update with minimum information
    try {
      // This approach uses a very simple update to minimize chances of error
      const { error } = await supabase.rpc(
        'update_tour_group_without_refresh',
        {
          p_group_id: groupId,
          p_guide_id: guideId,
          p_name: updatedName
        }
      );
      
      if (!error) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide with direct update");
        return true;
      }
      
      logger.error("🔄 [AssignGuide] Direct update also failed:", error);
    } catch (directError) {
      logger.error("🔄 [AssignGuide] Direct update error:", directError);
    }
    
    // Strategy 7: Last resort - multiple small updates
    try {
      // Update only guide_id first
      const { error: guideError } = await supabase
        .from("tour_groups")
        .update({ guide_id: guideId })
        .eq("id", groupId);
        
      if (!guideError) {
        // Then update name separately
        const { error: nameError } = await supabase
          .from("tour_groups")
          .update({ name: updatedName })
          .eq("id", groupId);
          
        if (!nameError) {
          logger.debug("🔄 [AssignGuide] Successfully updated guide with separate updates");
          return true;
        }
      }
    } catch (error) {
      logger.error("🔄 [AssignGuide] Separate updates failed:", error);
    }
    
    logger.error("🔄 [AssignGuide] All update strategies failed for group:", groupId);
    return false;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Unexpected error in updateDatabase:", error);
    return false;
  }
};
