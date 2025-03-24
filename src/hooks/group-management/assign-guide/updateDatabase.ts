
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";

/**
 * Update guide assignment in the database with multiple persistence strategies
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
    
    // Strategy 1: Use the enhanced updateGuideInSupabase function (most reliable)
    try {
      // First, get the tour_id for this group
      const { data: groupData, error: groupError } = await supabase
        .from("tour_groups")
        .select("tour_id")
        .eq("id", groupId)
        .maybeSingle();
        
      if (groupError || !groupData?.tour_id) {
        logger.error("🔄 [AssignGuide] Error getting tour_id for group:", groupError);
      } else {
        const tourId = groupData.tour_id;
        
        // Use the specialized function which handles multiple update attempts
        const success = await updateGuideInSupabase(tourId, groupId, guideId, updatedName);
        
        if (success) {
          logger.debug("🔄 [AssignGuide] Successfully updated guide assignment via updateGuideInSupabase");
          return true;
        }
      }
    } catch (error) {
      logger.error("🔄 [AssignGuide] Error in updateGuideInSupabase:", error);
      // Continue to fallback methods if this fails
    }
    
    // Strategy 2: Use retry mechanism with direct Supabase calls
    try {
      // Manually implement retry logic
      const maxRetries = 3;
      let attempt = 0;
      let success = false;
      
      while (attempt < maxRetries && !success) {
        try {
          const { error } = await supabase
            .from("tour_groups")
            .update({ 
              guide_id: guideId,
              name: updatedName,
              updated_at: new Date().toISOString()
            })
            .eq("id", groupId);
            
          if (!error) {
            logger.debug(`🔄 [AssignGuide] Successfully updated guide assignment with retry (attempt ${attempt + 1})`);
            success = true;
            break;
          } else {
            logger.error(`🔄 [AssignGuide] Error with retry update (attempt ${attempt + 1}/${maxRetries}):`, error);
          }
        } catch (err) {
          logger.error(`🔄 [AssignGuide] Exception in retry attempt ${attempt + 1}/${maxRetries}:`, err);
        }
        
        // Increment attempt and wait before retrying
        attempt++;
        if (attempt < maxRetries) {
          const delay = Math.min(500 * Math.pow(2, attempt), 3000); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      if (success) {
        return true;
      }
    } catch (error) {
      logger.error("🔄 [AssignGuide] Error with retry update:", error);
      // Continue to final fallback method
    }
    
    // Strategy 3: Direct Supabase update (last resort)
    try {
      const { error } = await supabase
        .from("tour_groups")
        .update({ 
          guide_id: guideId,
          name: updatedName,
          updated_at: new Date().toISOString()
        })
        .eq("id", groupId);
        
      if (error) {
        logger.error("🔄 [AssignGuide] Error with direct update:", error);
        return false;
      }
      
      logger.debug("🔄 [AssignGuide] Successfully updated guide assignment with direct update");
      return true;
    } catch (error) {
      logger.error("🔄 [AssignGuide] Unexpected error in final fallback update:", error);
      return false;
    }
  } catch (error) {
    logger.error("🔄 [AssignGuide] Unexpected error in updateDatabase:", error);
    return false;
  }
};
