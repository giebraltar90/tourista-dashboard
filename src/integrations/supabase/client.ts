
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Add Supabase client with retry functionality
export const supabaseWithRetry = {
  from: (table: string) => {
    const maxRetries = 3;
    
    return {
      updateWithRetry: async (data: any, match: any) => {
        let attempt = 1;
        let error = null;
        
        // Try to update with exponential backoff
        while (attempt <= maxRetries) {
          try {
            const queryBuilder = supabase.from(table).update(data);
            
            // Add all match conditions
            for (const [key, value] of Object.entries(match)) {
              queryBuilder.eq(key, value);
            }
            
            const result = await queryBuilder;
            error = result.error;
            
            if (!error) {
              return { error: null, attempt };
            }
            
            // Wait before retrying with exponential backoff
            await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt)));
            attempt++;
          } catch (err) {
            error = err;
            attempt++;
          }
        }
        
        return { error, attempt: maxRetries };
      }
    };
  }
};

// Add function to check database connection
export const checkDatabaseConnection = async (): Promise<{connected: boolean; error?: string}> => {
  try {
    // Simple query to check if database is responsive
    const { error } = await supabase.from('tours').select('id', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection check failed:', error);
      return { connected: false, error: error.message };
    }
    
    return { connected: true };
  } catch (error) {
    console.error('Database connection error:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
};
