
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Manual sync method that doesn't rely on database functions
 * and doesn't trigger materialized view refresh
 */
export const manualSyncTourData = async (tourId: string): Promise<boolean> => {
  try {
    // Get all groups for this tour
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      logger.error("Error fetching groups for manual sync:", groupsError);
      return false;
    }
    
    if (!groups || groups.length === 0) {
      logger.debug("No groups to sync for tour:", tourId);
      return true;
    }
    
    // For each group, update its size and child_count based on participants
    let success = true;
    for (const group of groups) {
      try {
        // Use our retry utility to handle intermittent network issues
        await supabaseWithRetry(async () => {
          // Get participants for this group
          const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('count, child_count')
            .eq('group_id', group.id);
            
          if (participantsError) {
            throw participantsError;
          }
          
          // Calculate size and child_count
          let groupSize = 0;
          let groupChildCount = 0;
          
          if (participants && participants.length > 0) {
            participants.forEach(p => {
              groupSize += p.count || 0;
              groupChildCount += p.child_count || 0;
            });
          }
          
          // Try to get current group data
          const { data: groupData, error: groupError } = await supabase
            .from('tour_groups')
            .select('name, guide_id, entry_time')
            .eq('id', group.id)
            .single();
            
          if (groupError) {
            throw groupError;
          }
          
          // Direct update with all fields preserved
          const { error: updateError } = await supabase
            .from('tour_groups')
            .update({ 
              size: groupSize,
              child_count: groupChildCount,
              updated_at: new Date().toISOString(),
              // Preserve these fields to maintain consistency
              name: groupData.name,
              guide_id: groupData.guide_id,
              entry_time: groupData.entry_time
            })
            .eq('id', group.id);
            
          if (updateError) throw updateError;
          
          return { success: true };
        });
      } catch (error) {
        logger.error(`Error updating group ${group.id}:`, error);
        success = false;
      }
    }
    
    return success;
  } catch (error) {
    logger.error("Error in manualSyncTourData:", error);
    return false;
  }
};
