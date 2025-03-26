
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { queryCache } from './cache';
import { supabaseWithRetry } from './retry';
import { FETCH_TIMEOUT } from './constants';

// Supabase client initialization with improved retry and timeout settings
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://hznwikjmwmskvoqgkvjk.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY',
  {
    global: {
      fetch: (url, options) => {
        // Add headers to avoid CORS issues
        const headers = {
          ...(options?.headers || {}),
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
        
        // Use a longer timeout for fetch operations with AbortSignal
        return fetch(url, {
          ...options,
          headers,
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
          cache: 'no-store',
          mode: 'cors',
          credentials: 'same-origin',
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
        eventsPerSecond: 5, // Reduce events per second to be gentler on the connection
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
