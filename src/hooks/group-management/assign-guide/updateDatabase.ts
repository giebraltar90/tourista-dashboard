
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { toast } from "sonner";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";

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
    
    // Strategy 1: Use updateGuideInSupabase which has multiple fallback strategies
    try {
      const success = await updateGuideInSupabase(null, groupId, guideId, updatedName);
      if (success) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide with updateGuideInSupabase");
        return true;
      }
    } catch (error) {
      logger.debug("🔄 [AssignGuide] updateGuideInSupabase failed:", error);
    }
    
    // Strategy 2: Use direct update approach
    try {
      const updateData = { 
        guide_id: guideId,
        name: updatedName,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("tour_groups")
        .update(updateData)
        .eq("id", groupId);
        
      if (!error) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide with standard update");
        return true;
      }
      
      logger.debug("🔄 [AssignGuide] Standard update failed, trying alternative approaches:", error);
    } catch (directError) {
      logger.debug("🔄 [AssignGuide] Standard update exception:", directError);
    }
    
    // Strategy 3: Use the assign_guide_safely function
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
      
      logger.debug("🔄 [AssignGuide] assign_guide_safely function failed, trying next approach:", error);
    } catch (rpcError) {
      logger.debug("🔄 [AssignGuide] assign_guide_safely function not available:", rpcError);
    }
    
    // Strategy 4: Use the update_group_guide_no_triggers function
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
      
      logger.debug("🔄 [AssignGuide] update_group_guide_no_triggers function failed, trying next approach:", error);
    } catch (rpcError) {
      logger.debug("🔄 [AssignGuide] update_group_guide_no_triggers function not available:", rpcError);
    }
    
    // Strategy 5: Use the safe_update_tour_group function with all fields
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
    
    // Strategy 6: Retry with backoff using supabaseWithRetry
    try {
      const updateData = { 
        guide_id: guideId,
        name: updatedName,
        updated_at: new Date().toISOString()
      };
      
      const result = await supabaseWithRetry(async () => {
        const { error } = await supabase
          .from("tour_groups")
          .update(updateData)
          .eq("id", groupId);
          
        if (error) throw error;
        return { success: true };
      });
      
      if (result && result.success) {
        logger.debug("🔄 [AssignGuide] Successfully updated guide with retry mechanism");
        return true;
      }
    } catch (retryError) {
      logger.debug("🔄 [AssignGuide] All retries failed:", retryError);
    }
    
    // Strategy 7: Try multiple small updates
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
    
    // If all strategies failed, show an error toast
    toast.error("Failed to assign guide due to database error. Please try again.");
    logger.error("🔄 [AssignGuide] All update strategies failed for group:", groupId);
    return false;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Unexpected error in updateDatabase:", error);
    toast.error("Unexpected error assigning guide. Please try again.");
    return false;
  }
};
