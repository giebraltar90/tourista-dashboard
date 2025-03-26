
import { supabase } from './client';
import { API_ANON_KEY } from './constants';
import { logger } from '@/utils/logger';

// Check if authentication is working correctly
export const checkAuth = async () => {
  try {
    logger.debug("Checking Supabase authentication...");
    
    // Try a simple request that requires authentication
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1);
      
    if (error) {
      logger.error("Authentication check failed:", error);
      
      // Check if this is an auth error
      if (error.code === '401' || 
          error.message.includes('API key') || 
          error.message.includes('auth')) {
        return {
          authenticated: false,
          error: error.message,
          errorCode: error.code,
          key: API_ANON_KEY ? API_ANON_KEY.substring(0, 10) + '...' : 'None'
        };
      }
      
      return {
        authenticated: false,
        error: error.message,
        errorCode: error.code
      };
    }
    
    logger.debug("Authentication check succeeded");
    
    return {
      authenticated: true,
      error: null
    };
  } catch (err) {
    logger.error("Exception in authentication check:", err);
    
    return {
      authenticated: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
};

// Get authentication headers for manual requests
export const getAuthHeaders = () => {
  return {
    'apikey': API_ANON_KEY,
    'Authorization': `Bearer ${API_ANON_KEY}`
  };
};

// Export for use throughout the application
export { API_ANON_KEY };
