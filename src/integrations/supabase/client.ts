
import { createClient } from '@/integrations/supabase/client';

// Supabase client initialization with fetch options to handle network errors
export const supabase = createClient({ 
  // Add fetch options to handle timeouts and network issues
  fetch: (url, options) => {
    const fetchOptions = {
      ...options,
      // Set a timeout for all fetch requests
      signal: AbortSignal.timeout(10000), // 10-second timeout
    };
    
    return fetch(url, fetchOptions);
  }
});

// Add a helper for checking database connectivity
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('tours').select('id').limit(1);
    return { connected: !error, error: error?.message };
  } catch (err) {
    console.error("Database connection check failed:", err);
    return { connected: false, error: err instanceof Error ? err.message : 'Unknown connection error' };
  }
};
