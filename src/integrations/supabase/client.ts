
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Increase timeout settings to prevent frequent timeouts
const FETCH_TIMEOUT = 30000; // 30 seconds timeout
const MAX_RETRIES = 3; // Maximum number of retries for operations
const CACHE_TTL = 30000; // 30 seconds cache timeout

// Simple cache implementation
class SimpleCache {
  private cache: Map<string, {data: any, timestamp: number}> = new Map();
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  invalidate(keyPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Create a global cache instance
export const queryCache = new SimpleCache();

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
      console.error("Database connection check failed (query error):", error);
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
      console.warn("Tour groups table access error:", tourGroupsCheck.error);
    }
    
    return { connected: true, error: null };
  } catch (err) {
    console.error("Database connection check failed (exception):", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
    return { 
      connected: false, 
      error: errorMessage,
      hint: 'An unexpected error occurred while connecting to the database'
    };
  }
};

// Create a utility for Supabase retries with exponential backoff
export const supabaseWithRetry = async (operation: () => Promise<any>, maxRetries = MAX_RETRIES) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add delay before retries (except the first attempt)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(1.5, attempt), 10000) + Math.random() * 500;
        console.log(`Retry attempt ${attempt+1}/${maxRetries} after ${delay.toFixed(0)}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await operation();
      
      // If operation result indicates we shouldn't retry (e.g., a check returned {recoverable: false})
      if (result && typeof result === 'object' && result.recoverable === false) {
        console.log("Operation returned non-recoverable result, no more retries");
        return result;
      }
      
      return result;
    } catch (error) {
      console.error(`Supabase operation failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // Break early for some types of errors that won't be fixed by retrying
      // For example, permission issues or syntax errors
      if (error && typeof error === 'object') {
        // Check if error is not a timeout or network error
        const errorCode = error.code?.toString() || '';
        if (errorCode && !['23', '20', 'ECONNABORTED', 'ETIMEDOUT'].includes(errorCode)) {
          console.log(`Error code ${errorCode} indicates non-recoverable error, stopping retries`);
          break;
        }
      }
    }
  }
  
  console.error('All retry attempts failed:', lastError);
  throw lastError;
};

// Re-export createClient with a better name to avoid circular dependencies
export const createClient = createSupabaseClient;

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
      console.error("Error fetching tour statistics:", error);
      // Fall back to direct queries if the materialized view fails
      return null;
    }
    
    // Cache the result
    queryCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error("Exception fetching tour statistics:", err);
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
    console.log("All realtime subscriptions have been disabled");
  } catch (error) {
    console.error("Error disabling realtime subscriptions:", error);
  }
};
