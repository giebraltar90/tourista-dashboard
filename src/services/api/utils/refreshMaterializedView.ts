
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Refresh the tour_statistics materialized view
 */
export const refreshTourStatisticsView = async (): Promise<boolean> => {
  try {
    logger.debug("💾 [API] Refreshing tour_statistics materialized view");
    
    const { error } = await supabase.rpc('refresh_tour_statistics');
    
    if (error) {
      logger.error("💾 [API] Error refreshing tour_statistics view:", error);
      return false;
    }
    
    logger.debug("💾 [API] Successfully refreshed tour_statistics view");
    return true;
  } catch (err) {
    logger.error("💾 [API] Exception refreshing tour_statistics view:", err);
    return false;
  }
};

/**
 * Force refresh of all caches and materialized views for a tour
 */
export const forceRefreshTourData = async (tourId: string): Promise<boolean> => {
  try {
    // First sync all tour groups
    const syncResult = await supabase.rpc('sync_all_tour_groups', {
      p_tour_id: tourId
    });
    
    if (syncResult.error) {
      logger.error("💾 [API] Error syncing tour groups:", syncResult.error);
    }
    
    // Then refresh the materialized view
    const viewResult = await refreshTourStatisticsView();
    
    // Invalidate query cache for this tour - use .then() instead of .catch()
    supabase.rpc('invalidate_tour_cache', {
      p_tour_id: tourId
    }).then(result => {
      if (result.error) {
        logger.warn("💾 [API] Error invalidating tour cache:", result.error);
      }
    }).catch(err => {
      logger.warn("💾 [API] Exception invalidating tour cache:", err);
    });
    
    return !syncResult.error && viewResult;
  } catch (err) {
    logger.error("💾 [API] Exception in forceRefreshTourData:", err);
    return false;
  }
};
