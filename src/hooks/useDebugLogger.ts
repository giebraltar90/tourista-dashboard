
import { useEffect } from 'react';
import { useDebugMode } from '@/contexts/DebugContext';
import { logger } from '@/utils/logger';

export const useDebugLogger = () => {
  const debugMode = useDebugMode();
  
  useEffect(() => {
    // Update the logger's debug mode based on context
    logger.setDebugMode(debugMode);
    
    // Provide debug feedback to the console
    if (debugMode) {
      console.log('Debug logging activated - all console logs will be visible');
    } else {
      console.log('Debug logging deactivated - only warnings and errors will be shown');
    }
  }, [debugMode]);
  
  return logger;
};
