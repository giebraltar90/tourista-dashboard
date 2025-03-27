
import { logger } from '@/utils/logger';
import { API_ANON_KEY, API_BASE_URL } from './constants';
import { supabase } from './client';

/**
 * Test the Supabase connection with detailed diagnostics
 */
export const testSupabaseConnection = async () => {
  try {
    logger.debug("Testing Supabase connection...");
    
    // First do a basic fetch to check API availability
    try {
      const response = await fetch(`${API_BASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': API_ANON_KEY,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        logger.error(`Supabase API not available: ${response.status} ${response.statusText}`);
        return { 
          success: false, 
          error: `API not available: ${response.status} ${response.statusText}` 
        };
      }
    } catch (networkErr) {
      logger.error("Network error accessing Supabase:", networkErr);
      return { 
        success: false, 
        error: networkErr instanceof Error ? networkErr : new Error('Network error')
      };
    }
    
    // Then try actual query
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1);
      
    if (error) {
      logger.error("Supabase connection test failed:", error);
      return { success: false, error };
    }
    
    logger.debug("Supabase connection test succeeded!", data);
    return { success: true, data };
  } catch (err) {
    logger.error("Supabase connection test exception:", err);
    return { success: false, error: err };
  }
};
