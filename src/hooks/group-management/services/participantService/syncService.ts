
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { toast } from "sonner";

/**
 * Synchronize all participants and group sizes for a tour
 */
export const syncTourData = async (tourId: string): Promise<boolean> => {
  try {
    if (!tourId) {
      logger.error("Cannot sync tour data: missing tourId");
      return false;
    }
    
    // Try to use the RPC function if available
    try {
      const { data, error } = await supabase.rpc('sync_all_tour_groups', {
        p_tour_id: tourId
      });
      
      if (!error) {
        logger.debug("Successfully synchronized tour data for tour:", tourId);
        return true;
      }
      
      // If we get a permission error, try manual sync
      if (error.message.includes('materialized view')) {
        logger.debug("Permission issue with materialized view, trying manual sync");
        return await manualSyncTourData(tourId);
      }
      
      logger.error("Error synchronizing tour data:", error);
      return false;
      
    } catch (err) {
      // If RPC call fails, try manual sync
      logger.debug("RPC function unavailable, falling back to manual sync");
      return await manualSyncTourData(tourId);
    }
  } catch (err) {
    logger.error("Unexpected error in syncTourData:", err);
    return false;
  }
};

/**
 * Manual sync method that doesn't rely on database functions
 */
const manualSyncTourData = async (tourId: string): Promise<boolean> => {
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
      // Get participants for this group
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('count, child_count')
        .eq('group_id', group.id);
        
      if (participantsError) {
        logger.error(`Error fetching participants for group ${group.id}:`, participantsError);
        success = false;
        continue;
      }
      
      // Calculate size and child_count
      let size = 0;
      let childCount = 0;
      
      if (participants && participants.length > 0) {
        participants.forEach(p => {
          size += p.count || 0;
          childCount += p.child_count || 0;
        });
      }
      
      // Update the group
      const { error: updateError } = await supabase
        .from('tour_groups')
        .update({ 
          size,
          child_count: childCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id);
        
      if (updateError) {
        logger.error(`Error updating group ${group.id} during manual sync:`, updateError);
        success = false;
      }
    }
    
    return success;
  } catch (error) {
    logger.error("Error in manualSyncTourData:", error);
    return false;
  }
};

/**
 * Backward compatibility function for existing code
 */
export const syncTourGroupSizes = async (tourId: string): Promise<boolean> => {
  return syncTourData(tourId);
};

/**
 * Ensure the sync function exists
 */
export const ensureSyncFunction = async (): Promise<void> => {
  try {
    // Check if the function exists by trying to call it with an invalid UUID
    // This will fail with a function-specific error rather than a "function not found" error
    await supabase.rpc('sync_all_tour_groups', {
      p_tour_id: '00000000-0000-0000-0000-000000000000'
    });
    
    // If we get here, function exists
    logger.debug("sync_all_tour_groups function exists");
  } catch (error: any) {
    // Check if this is a "function not found" error
    if (error?.message?.includes('function "sync_all_tour_groups" does not exist')) {
      logger.error("sync_all_tour_groups function does not exist, might need database migration");
      // Don't show a toast here, as this is just a check
    } else {
      // This is an expected error (invalid UUID) which means the function exists
      logger.debug("sync_all_tour_groups function exists (error was expected)");
    }
  }
};
