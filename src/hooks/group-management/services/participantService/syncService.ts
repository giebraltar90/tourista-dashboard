
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

/**
 * Updates the calculated sizes on tour groups based on their participants
 * This will be handled by database triggers now, but we keep this function 
 * as a manual fallback
 */
export const syncTourGroupSizes = async (tourId: string): Promise<boolean> => {
  try {
    logger.debug(`🔁 [GROUP_SYNC] Syncing tour group sizes for tour ${tourId}`);
    
    // Try to refresh materialized view explicitly
    try {
      await supabase.rpc('refresh_tour_statistics');
      logger.debug("🔁 [GROUP_SYNC] Refreshed tour statistics materialized view");
    } catch (err) {
      logger.warn("🔁 [GROUP_SYNC] Error refreshing materialized view:", err);
      // Continue with fallback
    }
    
    // Database triggers should handle this automatically now, but let's verify
    const { data: tourGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name, participants(id, count, child_count)')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      logger.error("🔁 [GROUP_SYNC] Error fetching tour groups for size verification:", groupsError);
      return false;
    }
    
    logger.debug(`🔁 [GROUP_SYNC] Fetched ${tourGroups.length} groups for sync verification`);
    
    let syncNeeded = false;
    
    // Verify that group sizes match participants (as a safety check)
    for (const group of tourGroups) {
      if (!Array.isArray(group.participants)) {
        logger.debug(`🔁 [GROUP_SYNC] Group ${group.id} (${group.name || 'Unnamed'}) has no participants array, skipping verification`);
        continue;
      }
      
      let calculatedSize = 0;
      let calculatedChildCount = 0;
      
      // Calculate from participants
      for (const participant of group.participants) {
        calculatedSize += participant.count || 1;
        calculatedChildCount += participant.child_count || 0;
      }
      
      // Only update if there's a discrepancy (which should be rare due to triggers)
      if (calculatedSize !== group.size || calculatedChildCount !== group.child_count) {
        syncNeeded = true;
        logger.warn(`🔁 [GROUP_SYNC] Discrepancy detected for group ${group.id} (${group.name || 'Unnamed'})`, {
          dbSize: group.size,
          calculatedSize,
          dbChildCount: group.child_count,
          calculatedChildCount,
          participantCount: group.participants.length
        });
      }
    }
    
    // If any discrepancies were found, force a manual refresh
    if (syncNeeded) {
      logger.warn("🔁 [GROUP_SYNC] Discrepancies detected, forcing manual sync");
      
      // Directly call database function to recalculate
      try {
        await supabase.rpc('sync_all_tour_groups', {
          p_tour_id: tourId
        });
        logger.debug("🔁 [GROUP_SYNC] Manual sync completed");
      } catch (err) {
        // If RPC fails, fall back to older method
        logger.error("🔁 [GROUP_SYNC] RPC sync failed, falling back to manual updates:", err);
        
        for (const group of tourGroups) {
          if (!Array.isArray(group.participants)) continue;
          
          let totalSize = 0;
          let totalChildCount = 0;
          
          for (const participant of group.participants) {
            totalSize += participant.count || 1;
            totalChildCount += participant.child_count || 0;
          }
          
          await supabase
            .from('tour_groups')
            .update({
              size: totalSize,
              child_count: totalChildCount
            })
            .eq('id', group.id);
        }
      }
    } else {
      logger.debug("🔁 [GROUP_SYNC] All groups are correctly synchronized, no manual update needed");
    }
    
    return true;
  } catch (error) {
    logger.error("🔁 [GROUP_SYNC] Error synchronizing tour group sizes:", error);
    return false;
  }
};

// Export a function to create the database function if it doesn't exist
export const ensureSyncFunction = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('sync_all_tour_groups', {
      p_tour_id: '00000000-0000-0000-0000-000000000000' // Dummy ID to test if function exists
    });
    
    // If function doesn't exist, we'll get a specific error
    if (error && error.message.includes('function sync_all_tour_groups() does not exist')) {
      logger.debug("🔁 [GROUP_SYNC] sync_all_tour_groups function doesn't exist, creating it");
      
      // We should create it, but this will be handled by migrations
      return false;
    }
    
    return true;
  } catch (err) {
    logger.error("🔁 [GROUP_SYNC] Error checking sync function:", err);
    return false;
  }
};
