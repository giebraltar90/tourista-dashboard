
import { useEffect, useState } from 'react';
import { logger } from '@/utils/logger';
import { checkAuthentication, getApiConfig } from './auth-service';

/**
 * Hook to check and monitor Supabase authentication status
 */
export const useSupabaseAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check authentication on mount
  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        setIsChecking(true);
        setError(null);
        
        const authResult = await checkAuthentication();
        
        setIsAuthenticated(authResult.authenticated);
        setError(authResult.error);
      } finally {
        setIsChecking(false);
      }
    };
    
    // Execute authentication check
    performAuthCheck();
    
    // Set up an interval to recheck auth status periodically
    const authCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        performAuthCheck();
      }
    }, 300000); // Check every 5 minutes
    
    // Also recheck when the app comes back online
    const handleOnline = () => performAuthCheck();
    window.addEventListener('online', handleOnline);
    
    // Clean up
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  // Get API configuration
  const { apiKey, supabaseUrl } = getApiConfig();
  
  // Provide auth information to components
  return {
    isAuthenticated,
    isChecking,
    error,
    apiKey,
    supabaseUrl
  };
};
