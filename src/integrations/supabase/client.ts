
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Supabase client initialization with enhanced fetch options and retry logic
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://hznwikjmwmskvoqgkvjk.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY',
  {
    global: {
      // Improved fetch options with longer timeout and better error handling
      fetch: (url, options) => {
        // Build proper headers
        const headers = {
          ...options?.headers,
          'x-client-info': 'tour-management-app',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY',
        };

        return fetch(url, {
          ...options,
          headers,
          signal: AbortSignal.timeout(30000), // Increase timeout to 30 seconds
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
    
    // Now check multiple tables to ensure full database integrity
    const tables = ['tour_groups', 'participants', 'guides', 'bucket_tour_assignments'];
    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1);
          
        return {
          table,
          exists: !tableError || !tableError.message.includes(`relation "${table}" does not exist`),
          error: tableError?.message
        };
      })
    );
    
    const missingTables = tableChecks.filter(check => !check.exists);
    
    if (missingTables.length > 0) {
      console.warn("Some tables are missing:", missingTables);
      return {
        connected: true, 
        error: `Missing tables: ${missingTables.map(t => t.table).join(', ')}`,
        partialConnection: true,
        hint: 'Some database tables may need to be created'
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

// Improved Supabase client with retry mechanism for critical operations
export const supabaseWithRetry = {
  from: (table: string) => {
    const MAX_RETRIES = 3;
    
    return {
      ...supabase.from(table),
      updateWithRetry: async (data: any, matchCriteria: Record<string, any>) => {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            const query = supabase.from(table).update(data);
            
            // Apply all match criteria (e.g. .eq('id', id).eq('tour_id', tourId))
            Object.entries(matchCriteria).forEach(([key, value]) => {
              query.eq(key, value);
            });
            
            const { data: result, error } = await query;
            
            if (!error) {
              return { data: result, error: null, attempt };
            }
            
            if (attempt < MAX_RETRIES) {
              // Wait with exponential backoff before retrying
              await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
              console.log(`Retry ${attempt} for ${table} update...`);
            } else {
              return { data: null, error, attempt };
            }
          } catch (err) {
            if (attempt === MAX_RETRIES) {
              return { 
                data: null, 
                error: err instanceof Error ? err : new Error('Unknown error'),
                attempt
              };
            }
          }
        }
        
        return { data: null, error: new Error('Max retries exceeded'), attempt: MAX_RETRIES };
      }
    };
  }
};

// Re-export createClient with a better name to avoid circular dependencies
export const createClient = createSupabaseClient;
