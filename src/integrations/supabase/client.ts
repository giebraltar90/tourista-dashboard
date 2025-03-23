
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Supabase client initialization with fetch options to handle network errors
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://hznwikjmwmskvoqgkvjk.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY',
  {
    fetch: (url, options) => {
      const fetchOptions = {
        ...options,
        // Set a timeout for all fetch requests
        signal: AbortSignal.timeout(10000), // 10-second timeout
      };
      
      return fetch(url, fetchOptions);
    }
  }
);

// Add a helper for checking database connection
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('tours').select('id').limit(1);
    return { connected: !error, error: error?.message };
  } catch (err) {
    console.error("Database connection check failed:", err);
    return { connected: false, error: err instanceof Error ? err.message : 'Unknown connection error' };
  }
};

// Re-export createClient with a better name to avoid circular dependencies
export const createClient = createSupabaseClient;
