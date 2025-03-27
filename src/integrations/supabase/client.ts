
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { queryCache } from './cache';
import { supabaseWithRetry } from './retry';
import { API_BASE_URL, API_ANON_KEY } from './constants';
import { customFetch } from './fetch';
import { getSupabaseUrl, getSupabaseKey } from './helpers';
import { testSupabaseConnection } from './connectionTest';

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

// Re-export createClient with a better name to avoid circular dependencies
export const createClient = createSupabaseClient;

// Re-export utility functions for easier access
export { queryCache, supabaseWithRetry };
export { getSupabaseUrl, getSupabaseKey };
export { testSupabaseConnection };

// Re-export connectivity functions for backward compatibility
export { 
  checkDatabaseConnection,
  getTourStatistics, 
  invalidateTourCache, 
  disableRealtimeSubscriptions 
} from './connectivity';
