
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Supabase client initialization with custom fetch options
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://hznwikjmwmskvoqgkvjk.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY',
  {
    global: {
      // Use AbortSignal.timeout as part of the global fetch options
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(15000), // Increase timeout to 15 seconds
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

// Add a helper for checking database connection
export const checkDatabaseConnection = async () => {
  try {
    // Try accessing a table that we know should exist
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
    
    // Now check if the newly recreated bucket_tour_assignments table exists
    const { error: assignmentError } = await supabase
      .from('bucket_tour_assignments')
      .select('id')
      .limit(1);
      
    if (assignmentError && !assignmentError.message.includes('relation "bucket_tour_assignments" does not exist')) {
      console.warn("Bucket assignment table check failed:", assignmentError);
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

// Re-export createClient with a better name to avoid circular dependencies
export const createClient = createSupabaseClient;
