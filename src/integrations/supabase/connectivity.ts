
import { supabase } from './client';
import { queryCache } from './cache';
import { logger } from '@/utils/logger';
import { supabaseWithRetry } from './retry';

// Add a helper for checking database connection with improved error handling
export const checkDatabaseConnection = async () => {
  try {
    // Try accessing a table that we know should exist with a short timeout
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      logger.error("Database connection check failed (query error):", error);
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
    const { data, error } = await supabase
      .from('tour_statistics')
      .select('*')
      .eq('tour_id', tourId)
      .single();
      
    if (error) {
      logger.error("Error fetching tour statistics:", error);
      // Fall back to direct queries if the materialized view fails
      return null;
    }
    
    // Cache the result
    queryCache.set(cacheKey, data);
    return data;
  } catch (err) {
    logger.error("Exception fetching tour statistics:", err);
    return null;
  }
};

// Function to invalidate cache for a specific tour
export const invalidateTourCache = (tourId: string) => {
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
