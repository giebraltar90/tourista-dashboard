
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Supabase client initialization with improved retry and timeout settings
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://hznwikjmwmskvoqgkvjk.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY',
  {
    global: {
      // Use a longer timeout for fetch operations
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(15000), // Reduced timeout to 15 seconds for faster failure
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
    // Add retry strategy
    realtime: {
      params: {
        eventsPerSecond: 10,
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
export const supabaseWithRetry = async (operation: () => Promise<any>, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add delay before retries (except the first attempt)
      if (attempt > 0) {
        const delay = Math.min(200 * Math.pow(1.5, attempt), 2000) + Math.random() * 200;
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
        if (error.code && !['23', '20'].includes(error.code)) {
          console.log(`Error code ${error.code} indicates non-recoverable error, stopping retries`);
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
