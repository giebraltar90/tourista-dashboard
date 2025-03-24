import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
