
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { API_ANON_KEY } from '@/integrations/supabase/constants';
import { logger } from '@/utils/logger';

/**
 * Hook to track Supabase authentication status
 */
export const useSupabaseAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check API key validity
        if (!API_ANON_KEY || API_ANON_KEY === 'YOUR_ANON_KEY') {
          logger.warn("Missing or invalid Supabase API key");
          setIsAuthenticated(false);
          return;
        }
        
        // Try a simple test query
        const { error } = await supabase
          .from('tours')
          .select('id')
          .limit(1);
          
        if (error) {
          logger.error("Auth check failed:", error);
          setIsAuthenticated(false);
        } else {
          logger.debug("Auth check successful - API key is valid");
          setIsAuthenticated(true);
        }
      } catch (err) {
        logger.error("Auth check exception:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};
