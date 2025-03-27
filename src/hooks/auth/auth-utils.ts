
import { logger } from '@/utils/logger';

/**
 * Check if the browser is currently online
 */
export const checkNetworkStatus = (): { online: boolean; error: string | null } => {
  if (!navigator.onLine) {
    logger.warn("Browser is offline");
    return { 
      online: false, 
      error: "Network is offline" 
    };
  }
  
  return { 
    online: true, 
    error: null 
  };
};

/**
 * Format error message from authentication process
 */
export const formatAuthError = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};
