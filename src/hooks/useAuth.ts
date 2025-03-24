
import { useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { logger } from '@/utils/logger';

// Mock authentication hook - in a real app, this would connect to an auth provider
export const useAuth = () => {
  const { setRole } = useRole();
  
  useEffect(() => {
    // This would normally check a token or session
    logger.debug('[Auth] Checking authentication on startup');
    
    // For development purposes, check if we have a role in session storage
    const savedRole = sessionStorage.getItem('userRole');
    const savedGuideName = sessionStorage.getItem('guideName');
    
    if (savedRole) {
      logger.debug(`[Auth] Found saved role: ${savedRole}`);
      
      // Restore the saved role
      if (savedRole === 'guide' && savedGuideName) {
        setRole('guide', { guideName: savedGuideName });
      } else {
        setRole(savedRole);
      }
    }
    
    // Register effect to save role changes
    const handleBeforeUnload = () => {
      // Clear any saved role on full page refresh/close
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('guideName');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [setRole]);
  
  return {
    // Auth methods would go here
    isAuthenticated: true, // Always return true for now
    userId: 'mock-user-id' // Placeholder
  };
};
