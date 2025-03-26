
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { queryCache } from './cache';
import { supabaseWithRetry } from './retry';
import { FETCH_TIMEOUT, API_BASE_URL, API_ANON_KEY } from './constants';
import { logger } from '@/utils/logger';

// Supabase client initialization with improved retry and timeout settings
export const supabase = createSupabaseClient(
  API_BASE_URL,
  API_ANON_KEY,
  {
    global: {
      fetch: (url, options) => {
        // Add headers to avoid CORS issues and ensure auth headers are sent
        const headers = {
          ...(options?.headers || {}),
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'apikey': API_ANON_KEY,
          'Authorization': `Bearer ${API_ANON_KEY}`
        };
        
        // Log the request URL and headers for debugging
        logger.debug(`Supabase request to ${url}`, { 
          headers: { ...headers, 'Authorization': '[REDACTED]' }
        });
        
        // Use a longer timeout for fetch operations with AbortSignal
        return fetch(url, {
          ...options,
          headers,
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
          cache: 'no-store',
          mode: 'cors',
          credentials: 'include',
        });
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    db: {
      schema: 'public',
    },
    // Add retry strategy for more resilient connections
    realtime: {
      params: {
        eventsPerSecond: 2, // Reduce events per second to be gentler on the connection
      },
    },
  }
);

// Re-export createClient with a better name to avoid circular dependencies
export const createClient = createSupabaseClient;

// Re-export utility functions for easier access
export { queryCache, supabaseWithRetry };
export { 
  checkDatabaseConnection, 
  getTourStatistics, 
  invalidateTourCache, 
  disableRealtimeSubscriptions 
} from './connectivity';

// Add a connection test helper for debugging
export const testSupabaseConnection = async () => {
  try {
    logger.debug("Testing Supabase connection...");
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1);
      
    if (error) {
      logger.error("Supabase connection test failed:", error);
      return { success: false, error };
    }
    
    logger.debug("Supabase connection test succeeded!", data);
    return { success: true, data };
  } catch (err) {
    logger.error("Supabase connection test exception:", err);
    return { success: false, error: err };
  }
};
