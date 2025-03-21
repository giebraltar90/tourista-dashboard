
import { useEffect } from 'react';
import { useDebugMode } from '@/contexts/DebugContext';
import { logger } from '@/utils/logger';

export const useDebugLogger = () => {
  const debugMode = useDebugMode();
  
  useEffect(() => {
    logger.setDebugMode(debugMode);
    
    if (debugMode) {
      console.log('Debug logging activated');
    } else {
      console.log('Debug logging deactivated');
    }
  }, [debugMode]);
  
  return logger;
};
