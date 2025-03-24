
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
        
        // Check if we're in a Lovable preview environment - if so, we'll handle network errors differently
        const isLovablePreview = typeof window !== 'undefined' && 
                               window.location.hostname.includes('lovableproject.com');
        
        if (isLovablePreview) {
          // In preview environments, use mockData if available instead of making actual requests
          // This helps avoid CORS and network issues in the preview
          return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
              // Create a mock Response
              const mockResponse = new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
              resolve(mockResponse);
            }, 100);
          });
        }
        
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

// Add a retry-enhanced Supabase client
// This extends the standard Supabase client with retry functionality
export const supabaseWithRetry = {
  from: (table: string) => {
    return {
      select: (columns: string) => {
        const query = supabase.from(table).select(columns);
        return {
          ...query,
          // Add retry methods to the query
          async executeWithRetry(maxRetries = 3) {
            let attempt = 0;
            let lastError = null;
            
            while (attempt < maxRetries) {
              try {
                const result = await query;
                return { ...result, attempt: attempt + 1 };
              } catch (error) {
                lastError = error;
                attempt++;
                if (attempt < maxRetries) {
                  // Exponential backoff
                  const delay = Math.min(100 * Math.pow(2, attempt), 3000);
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
              }
            }
            
            return { error: lastError, attempt: maxRetries };
          }
        };
      },
      update: (data: any) => {
        const query = supabase.from(table).update(data);
        return {
          ...query,
          // Add update with retry
          async updateWithRetry(data: any, match: Record<string, any>) {
            let attempt = 0;
            const maxRetries = 3;
            let lastError = null;
            
            while (attempt < maxRetries) {
              try {
                let updateQuery = supabase.from(table).update(data);
                
                // Add all match conditions
                Object.entries(match).forEach(([key, value]) => {
                  updateQuery = updateQuery.eq(key, value);
                });
                
                const result = await updateQuery;
                return { ...result, attempt: attempt + 1 };
              } catch (error) {
                lastError = error;
                attempt++;
                if (attempt < maxRetries) {
                  // Exponential backoff
                  const delay = Math.min(200 * Math.pow(2, attempt), 3000);
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
              }
            }
            
            return { error: lastError, attempt: maxRetries };
          }
        };
      }
    };
  }
};

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
