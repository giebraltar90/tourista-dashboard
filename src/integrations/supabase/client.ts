
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { queryCache } from './cache';
import { supabaseWithRetry } from './retry';
import { FETCH_TIMEOUT, API_BASE_URL, API_ANON_KEY } from './constants';
import { logger } from '@/utils/logger';
import { checkDatabaseConnection } from './connectivity/databaseCheck';

// Custom fetch implementation with better error handling and CORS support
const customFetch = (url, options) => {
  // Add headers to avoid CORS issues and ensure auth headers are sent
  const headers = {
    ...(options?.headers || {}),
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'apikey': API_ANON_KEY,
    'Authorization': `Bearer ${API_ANON_KEY}`,
    'Content-Type': 'application/json',
    // Adding these headers might help with some CORS issues
    'Accept': 'application/json',
    'X-Client-Info': 'supabase-js/2.x'
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
    credentials: 'omit', // Changed from 'include' to 'omit' to avoid some CORS issues
  }).catch(error => {
    logger.error(`Fetch error for ${url}:`, error);
    throw error;
  });
};

// Supabase client initialization with improved retry and timeout settings
export const supabase = createSupabaseClient(
  API_BASE_URL,
  API_ANON_KEY,
  {
    global: {
      fetch: customFetch,
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
        eventsPerSecond: 1, // Further reduce events per second
      },
    },
  }
);

// Helper functions to safely get protected properties
export const getSupabaseUrl = () => API_BASE_URL;
export const getSupabaseKey = () => API_ANON_KEY;

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
    
    // First do a basic fetch to check API availability
    try {
      const response = await fetch(`${API_BASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': API_ANON_KEY,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        logger.error(`Supabase API not available: ${response.status} ${response.statusText}`);
        return { 
          success: false, 
          error: `API not available: ${response.status} ${response.statusText}` 
        };
      }
    } catch (networkErr) {
      logger.error("Network error accessing Supabase:", networkErr);
      return { 
        success: false, 
        error: networkErr instanceof Error ? networkErr : new Error('Network error')
      };
    }
    
    // Then try actual query
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
