
import { supabase } from '../client';
import { logger } from '@/utils/logger';
import { invalidateTourCache } from './cacheManagement';

/**
 * Fetch tour statistics for a specific tour
 */
export const getTourStatistics = async (tourId: string) => {
  try {
    logger.debug(`Fetching statistics for tour ${tourId}`);
    
    // Check if we have a valid tour ID
    if (!tourId) {
      logger.error("Cannot fetch tour statistics: No tour ID provided");
      return null;
    }
    
    // Query tour statistics from the materialized view
    const { data, error } = await supabase
      .from('tour_statistics')
      .select('*')
      .eq('tour_id', tourId)
      .maybeSingle();
    
    if (error) {
      logger.error(`Error fetching tour statistics for ${tourId}:`, error);
      
      // Special handling for not-found data
      if (error.code === 'PGRST116') {
        return { tour_id: tourId, total_participants: 0, groups_count: 0 };
      }
      
      return null;
    }
    
    if (!data) {
      logger.debug(`No statistics found for tour ${tourId}, returning defaults`);
      return { tour_id: tourId, total_participants: 0, groups_count: 0 };
    }
    
    logger.debug(`Statistics for tour ${tourId}:`, data);
    return data;
  } catch (e) {
    logger.error(`Exception fetching tour statistics for ${tourId}:`, e);
    return null;
  }
};

/**
 * Invalidate statistics for a specific tour to force refresh
 */
export const invalidateTourStatistics = async (tourId: string): Promise<boolean> => {
  try {
    logger.debug(`Invalidating statistics for tour ${tourId}`);
    
    // Call the Supabase function to invalidate the cache
    const { data, error } = await supabase
      .rpc('invalidate_tour_cache', { p_tour_id: tourId });
    
    if (error) {
      logger.error(`Error invalidating tour statistics for ${tourId}:`, error);
      return false;
    }
    
    // Also invalidate any local cache
    invalidateTourCache(tourId);
    
    logger.debug(`Successfully invalidated statistics for tour ${tourId}`);
    return true;
  } catch (e) {
    logger.error(`Exception invalidating tour statistics for ${tourId}:`, e);
    return false;
  }
};
