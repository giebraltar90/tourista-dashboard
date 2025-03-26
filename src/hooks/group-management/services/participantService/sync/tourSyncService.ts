
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { manualSyncTourData } from "./manualSyncService";

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
      if (error.message.includes('materialized view') || error.code === '42501') {
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
    } else if (error?.message?.includes('materialized view') || error?.code === '42501') {
      // This is likely a permission error but means the function exists
      logger.debug("sync_all_tour_groups function exists but has permission issues");
    } else {
      // This is an expected error (invalid UUID) which means the function exists
      logger.debug("sync_all_tour_groups function exists (error was expected)");
    }
  }
};
