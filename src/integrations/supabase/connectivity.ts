
import { supabase } from './client';
import { queryCache } from './cache';
import { logger } from '@/utils/logger';
import { supabaseWithRetry } from './retry';
import { API_ANON_KEY, API_BASE_URL } from './constants';

// Add a helper for checking database connection with improved error handling
export const checkDatabaseConnection = async () => {
  try {
    // First, check if we can reach the Supabase URL
    const healthCheckUrl = `${API_BASE_URL}/rest/v1/`;
    try {
      const response = await fetch(healthCheckUrl, {
        method: 'HEAD',
        headers: {
          'apikey': API_ANON_KEY,
        }
      });
      
      logger.debug("Supabase API health check result:", { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        return { 
          connected: false, 
          error: `API health check failed with status: ${response.status}`,
          hint: 'Check your network connection and Supabase configuration'
        };
      }
    } catch (healthError) {
      logger.error("Supabase API health check failed:", healthError);
      return { 
        connected: false, 
        error: `Cannot reach Supabase API: ${healthError.message}`,
        hint: 'Check your network connection'
      };
    }
    
    // Try accessing a table that we know should exist with a short timeout
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      logger.error("Database connection check failed (query error):", error);
      
      // Check if this is an authentication error
      if (error.code === '401' || error.message.includes('API key')) {
        return { 
          connected: false, 
          error: 'Authentication failed. API key may be invalid or missing.',
          errorCode: error.code,
          hint: 'Check your Supabase API key'
        };
      }
      
      return { 
        connected: false, 
        error: error.message,
        errorCode: error.code,
        hint: 'Check your network connection and Supabase configuration'
      };
    }
    
    // Check connectivity to tour_groups table
    const tourGroupsCheck = await supabase
      .from('tour_groups')
      .select('id')
      .limit(1);
      
    if (tourGroupsCheck.error) {
      logger.warn("Tour groups table access error:", tourGroupsCheck.error);
    }
    
    return { connected: true, error: null };
  } catch (err) {
    logger.error("Database connection check failed (exception):", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
    return { 
      connected: false, 
      error: errorMessage,
      hint: 'An unexpected error occurred while connecting to the database'
    };
  }
};

// Function to query the materialized view for tour statistics
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

// Function to invalidate cache for a specific tour
export const invalidateTourCache = (tourId: string) => {
  logger.debug(`Invalidating cache for tour ${tourId}`);
  queryCache.invalidate(`tour_${tourId}`);
  queryCache.invalidate(`tour_statistics_${tourId}`);
};

// Helper function to disable WebSocket connections if they're causing issues
export const disableRealtimeSubscriptions = () => {
  try {
    supabase.removeAllChannels();
    logger.debug("All realtime subscriptions have been disabled");
  } catch (error) {
    logger.error("Error disabling realtime subscriptions:", error);
  }
};

// Add a function to manually refresh tour statistics
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
