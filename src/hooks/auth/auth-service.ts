
import { checkAuth, API_ANON_KEY } from '@/integrations/supabase/auth';
import { API_BASE_URL } from '@/integrations/supabase/constants';
import { logger } from '@/utils/logger';
import { checkNetworkStatus, formatAuthError } from './auth-utils';

/**
 * Check authentication status
 */
export const checkAuthentication = async () => {
  try {
    // Check network connectivity first
    const networkStatus = checkNetworkStatus();
    if (!networkStatus.online) {
      return {
        authenticated: false,
        checking: false,
        error: networkStatus.error
      };
    }
    
    // Perform authentication check
    try {
      const authStatus = await checkAuth();
      
      if (!authStatus.authenticated) {
        logger.error("Supabase authentication failed:", authStatus);
        
        return {
          authenticated: false,
          checking: false,
          error: authStatus.error || "Authentication failed"
        };
      } else {
        logger.debug("Supabase authentication is working");
        return {
          authenticated: true,
          checking: false,
          error: null
        };
      }
    } catch (authErr) {
      logger.error("Error during auth check:", authErr);
      return {
        authenticated: false,
        checking: false,
        error: formatAuthError(authErr)
      };
    }
  } catch (e) {
    logger.error("Error in authentication check:", e);
    return {
      authenticated: false,
      checking: false,
      error: formatAuthError(e)
    };
  }
};

/**
 * Get API configuration
 */
export const getApiConfig = () => {
  return {
    apiKey: API_ANON_KEY,
    supabaseUrl: API_BASE_URL
  };
};
