
import { supabase } from '../client';
import { queryCache } from '../cache';
import { logger } from '@/utils/logger';

/**
 * Get tour statistics from materialized view or fallback to direct calculation
 */
export const getTourStatistics = async (tourId: string) => {
  // Check cache first
  const cacheKey = `tour_statistics_${tourId}`;
  const cachedData = queryCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    logger.debug(`Fetching tour statistics for tour ${tourId}`);
    
    const { data, error } = await supabase
      .from('tour_statistics')
      .select('*')
      .eq('tour_id', tourId)
      .single();
      
    if (error) {
      logger.error("Error fetching tour statistics:", error);
      
      // If the materialized view fails, try direct queries
      try {
        logger.debug("Falling back to direct queries for tour statistics");
        
        // Get group counts
        const { data: groups, error: groupsError } = await supabase
          .from('tour_groups')
          .select('id, size, child_count')
          .eq('tour_id', tourId);
          
        if (groupsError) {
          logger.error("Error in fallback group query:", groupsError);
          return null;
        }
        
        // Get tour data
        const { data: tour, error: tourError } = await supabase
          .from('tours')
          .select('tour_name, location, date')
          .eq('id', tourId)
          .single();
          
        if (tourError) {
          logger.error("Error in fallback tour query:", tourError);
          return null;
        }
        
        // Calculate statistics
        const totalParticipants = groups.reduce((sum, g) => sum + (g.size || 0), 0);
        const totalChildCount = groups.reduce((sum, g) => sum + (g.child_count || 0), 0);
        
        const fallbackStats = {
          tour_id: tourId,
          tour_name: tour.tour_name,
          location: tour.location,
          date: tour.date,
          group_count: groups.length,
          total_participants: totalParticipants,
          total_child_count: totalChildCount,
          total_adult_count: totalParticipants - totalChildCount,
          guides_assigned: 0 // We don't have this info in fallback mode
        };
        
        // Cache the fallback result
        queryCache.set(cacheKey, fallbackStats);
        
        return fallbackStats;
      } catch (fallbackErr) {
        logger.error("Error in statistics fallback:", fallbackErr);
        return null;
      }
    }
    
    // Cache the result
    queryCache.set(cacheKey, data);
    
    logger.debug("Successfully fetched tour statistics");
    return data;
  } catch (err) {
    logger.error("Exception fetching tour statistics:", err);
    return null;
  }
};

/**
 * Manually refresh the tour statistics materialized view
 */
export const refreshTourStatistics = async (tourId: string) => {
  try {
    logger.debug(`Manually refreshing statistics for tour ${tourId}`);
    
    // First invalidate the cache
    invalidateTourCache(tourId);
    
    // Try to call the database function to refresh the statistics
    try {
      const { error } = await supabase.rpc('refresh_tour_statistics');
      
      if (error) {
        logger.error("Error calling refresh_tour_statistics RPC:", error);
      } else {
        logger.debug("Successfully refreshed tour statistics view");
      }
    } catch (rpcError) {
      logger.error("Exception calling refresh_tour_statistics RPC:", rpcError);
    }
    
    // Fetch fresh statistics
    return await getTourStatistics(tourId);
  } catch (error) {
    logger.error("Error refreshing tour statistics:", error);
    return null;
  }
};
