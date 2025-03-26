
import { MAX_RETRIES } from './constants';
import { logger } from '@/utils/logger';

// Utility for Supabase retries with exponential backoff
export const supabaseWithRetry = async (operation: () => Promise<any>, maxRetries = MAX_RETRIES) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add delay before retries (except the first attempt)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(1.5, attempt), 10000) + Math.random() * 500;
        logger.debug(`Retry attempt ${attempt+1}/${maxRetries} after ${delay.toFixed(0)}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await operation();
      
      // If operation result indicates we shouldn't retry (e.g., a check returned {recoverable: false})
      if (result && typeof result === 'object' && result.recoverable === false) {
        logger.debug("Operation returned non-recoverable result, no more retries");
        return result;
      }
      
      return result;
    } catch (error) {
      logger.error(`Supabase operation failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // Break early for some types of errors that won't be fixed by retrying
      // For example, permission issues or syntax errors
      if (error && typeof error === 'object') {
        // Check if error is not a timeout or network error
        const errorCode = error.code?.toString() || '';
        if (errorCode && !['23', '20', 'ECONNABORTED', 'ETIMEDOUT'].includes(errorCode)) {
          logger.debug(`Error code ${errorCode} indicates non-recoverable error, stopping retries`);
          break;
        }
      }
    }
  }
  
  logger.error('All retry attempts failed:', lastError);
  throw lastError;
};
