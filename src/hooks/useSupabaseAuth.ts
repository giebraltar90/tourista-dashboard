
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
      } catch (e) {
        logger.error("Error checking authentication:", e);
        setIsAuthenticated(false);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuthentication();
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
