
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Synchronize participant counts with the database
 * Uses the RPC function we created to update counts in one go
 */
export const syncParticipantCounts = async (tourId: string): Promise<boolean> => {
  try {
    logger.debug("🔄 [SYNC_PARTICIPANTS] Syncing participant counts for tour", tourId);
    
    const { data, error } = await supabase.rpc('update_participant_counts', {
      p_tour_id: tourId
    });
    
    if (error) {
      logger.error("🔄 [SYNC_PARTICIPANTS] Error syncing participant counts:", error);
      return false;
    }
    
    logger.debug("🔄 [SYNC_PARTICIPANTS] Successfully synced participant counts");
    return true;
  } catch (err) {
    logger.error("🔄 [SYNC_PARTICIPANTS] Exception in syncParticipantCounts:", err);
    return false;
  }
};

/**
 * Force refresh the tour statistics materialized view
 */
export const refreshTourStatisticsView = async (): Promise<boolean> => {
  try {
    logger.debug("🔄 [REFRESH_STATS] Refreshing tour statistics view");
    
    const { error } = await supabase.rpc('refresh_tour_statistics');
    
    if (error) {
      logger.error("🔄 [REFRESH_STATS] Error refreshing tour statistics:", error);
      return false;
    }
    
    logger.debug("🔄 [REFRESH_STATS] Successfully refreshed tour statistics");
    return true;
  } catch (err) {
    logger.error("🔄 [REFRESH_STATS] Exception in refreshTourStatisticsView:", err);
    return false;
  }
};
