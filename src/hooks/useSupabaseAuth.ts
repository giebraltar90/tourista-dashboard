
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkAuth, API_ANON_KEY } from '@/integrations/supabase/auth';
import { logger } from '@/utils/logger';
import { API_BASE_URL } from '@/integrations/supabase/constants';

/**
 * Hook to check and monitor Supabase authentication status
 */
export const useSupabaseAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsChecking(true);
        setError(null);
        
        // Check network connectivity first
        if (!navigator.onLine) {
          logger.warn("Browser is offline, assuming authentication failed");
          setIsAuthenticated(false);
          setError("Network is offline");
          setIsChecking(false);
          return;
        }
        
        // Use try-catch for the auth check
        try {
          const authStatus = await checkAuth();
          
          setIsAuthenticated(authStatus.authenticated);
          
          if (!authStatus.authenticated) {
            logger.error("Supabase authentication failed:", authStatus);
            
            if (authStatus.error) {
              setError(authStatus.error);
            } else {
              setError("Authentication failed");
            }
          } else {
            logger.debug("Supabase authentication is working");
          }
        } catch (authErr) {
          logger.error("Error during auth check:", authErr);
          setIsAuthenticated(false);
          setError(authErr instanceof Error ? authErr.message : String(authErr));
        }
      } catch (e) {
        logger.error("Error in useSupabaseAuth hook:", e);
        setIsAuthenticated(false);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsChecking(false);
      }
    };
    
    // Execute authentication check
    checkAuthentication();
    
    // Set up an interval to recheck auth status periodically
    const authCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        checkAuthentication();
      }
    }, 300000); // Check every 5 minutes
    
    // Also recheck when the app comes back online
    const handleOnline = () => checkAuthentication();
    window.addEventListener('online', handleOnline);
    
    // Clean up
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  // Provide auth information to components
  return {
    isAuthenticated,
    isChecking,
    error,
    apiKey: API_ANON_KEY,
    supabaseUrl: API_BASE_URL
  };
};
