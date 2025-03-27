
import { supabase } from '../client';
import { logger } from '@/utils/logger';
import { API_ANON_KEY, API_BASE_URL } from '../constants';

/**
 * Check if the database connection is working
 */
export const checkDatabaseConnection = async () => {
  try {
    // First, check if we can reach the Supabase URL
    const healthCheckUrl = `${API_BASE_URL}/rest/v1/`;
    try {
      const response = await fetch(healthCheckUrl, {
        method: 'HEAD',
        headers: {
          'apikey': API_ANON_KEY,
        }
      });
      
      logger.debug("Supabase API health check result:", { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        return { 
          connected: false, 
          error: `API health check failed with status: ${response.status}`,
          hint: 'Check your network connection and Supabase configuration'
        };
      }
    } catch (healthError) {
      logger.error("Supabase API health check failed:", healthError);
      return { 
        connected: false, 
        error: `Cannot reach Supabase API: ${healthError.message}`,
        hint: 'Check your network connection'
      };
    }
    
    // Try accessing a table that we know should exist with a short timeout
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      logger.error("Database connection check failed (query error):", error);
      
      // Check if this is an authentication error
      if (error.code === '401' || error.message.includes('API key')) {
        return { 
          connected: false, 
          error: 'Authentication failed. API key may be invalid or missing.',
          errorCode: error.code,
          hint: 'Check your Supabase API key'
        };
      }
      
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
      logger.warn("Tour groups table access error:", tourGroupsCheck.error);
    }
    
    return { connected: true, error: null };
  } catch (err) {
    logger.error("Database connection check failed (exception):", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
    return { 
      connected: false, 
      error: errorMessage,
      hint: 'An unexpected error occurred while connecting to the database'
    };
  }
};
