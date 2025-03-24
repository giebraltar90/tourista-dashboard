
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Supabase client initialization with enhanced fetch options and retry logic
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://hznwikjmwmskvoqgkvjk.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY',
  {
    global: {
      // Improved fetch options with longer timeout and better error handling
      fetch: (url, options) => {
        // Make sure API key is always included
        const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY';
        
        // Check if URL actually contains the project ID to avoid logging noise
        const isSupabaseUrl = url.toString().includes('hznwikjmwmskvoqgkvjk');
        if (isSupabaseUrl) {
          console.log(`[Supabase] Fetching ${url}`);
        }
        
        // Build proper headers with correct authorization
        const headers = {
          ...options?.headers,
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'x-client-info': '@supabase/javascript-sdk/2.x.x'
        };
        
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.error(`[Supabase] Request timeout for ${url}`);
        }, 30000); // 30 second timeout
        
        return fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        }).then(response => {
          clearTimeout(timeoutId);
          
          if (response.status === 401) {
            console.error("[Supabase] Authentication error (401). API key might be invalid or missing:", {
              url: url.toString().split('?')[0] // Log URL but strip query params for security
            });
            // Dispatch an event so we can show a UI notification
            window.dispatchEvent(new CustomEvent('supabase-auth-error'));
          }
          
          if (!response.ok && isSupabaseUrl) {
            console.error(`[Supabase] HTTP error ${response.status} for ${url.toString().split('?')[0]}`);
          }
          
          return response;
        }).catch(error => {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError') {
            console.error(`[Supabase] Request aborted for ${url}`);
            throw new Error('Request timeout or aborted');
          }
          
          console.error(`[Supabase] Network error: ${error.message}`, {
            url: url.toString().split('?')[0],
            error
          });
          throw error;
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
    // Enhanced retry strategy
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Add a helper for checking database connection with improved error reporting
export const checkDatabaseConnection = async () => {
  try {
    // Try accessing a table that we know should exist with a higher timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error("Database connection check failed (query error):", error);
      return { 
        connected: false, 
        error: error.message,
        errorCode: error.code,
        hint: 'Check your network connection and Supabase configuration'
      };
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
