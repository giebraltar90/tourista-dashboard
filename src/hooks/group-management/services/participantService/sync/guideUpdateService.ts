
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Directly update a group's guide without using the materialized view
 */
export const updateGroupGuideDirectly = async (
  groupId: string,
  guideId: string | null,
  groupName: string
): Promise<boolean> => {
  try {
    // Get current group data first to preserve other fields
    const { data: groupData, error: getError } = await supabase
      .from('tour_groups')
      .select('size, child_count, entry_time, tour_id')
      .eq('id', groupId)
      .single();
      
    if (getError) {
      logger.error("Error fetching group data for direct update:", getError);
      return false;
    }
    
    // Update with all fields to prevent issues
    const { error: updateError } = await supabase
      .from('tour_groups')
      .update({
        guide_id: guideId,
        name: groupName,
        size: groupData.size,
        child_count: groupData.child_count,
        entry_time: groupData.entry_time,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId);
      
    if (updateError) {
      logger.error("Error in direct group guide update:", updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error("Exception in updateGroupGuideDirectly:", error);
    return false;
  }
};
