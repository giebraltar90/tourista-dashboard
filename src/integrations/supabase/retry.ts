
import { MAX_RETRIES } from './constants';
import { logger } from '@/utils/logger';

// Utility for Supabase retries with exponential backoff and detailed logging
export const supabaseWithRetry = async (operation: () => Promise<any>, maxRetries = MAX_RETRIES) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add delay before retries (except the first attempt)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 15000) + Math.random() * 1000;
        logger.debug(`Retry attempt ${attempt+1}/${maxRetries} after ${delay.toFixed(0)}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await operation();
      
      // If operation was successful but returned an error property
      if (result && typeof result === 'object' && result.error) {
        lastError = result.error;
        logger.debug(`Operation returned error object on attempt ${attempt + 1}/${maxRetries}:`, result.error);
        
        // Check if this is an authentication error (401) which requires special handling
        if (result.error.code === '401' || 
            (result.error.message && result.error.message.includes('API key'))) {
          logger.error("Authentication error detected:", result.error);
          // These errors won't be fixed by retrying with the same client
          throw result.error;
        }
        
        // If error indicates non-recoverable issue, stop retrying
        if (result.recoverable === false) {
          logger.debug("Operation returned non-recoverable result, no more retries");
          return result;
        }
        
        // Continue to next retry for recoverable errors
        continue;
      }
      
      // Successful result with no error
      return result;
    } catch (error) {
      logger.error(`Supabase operation failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // Break early for some types of errors that won't be fixed by retrying
      if (error && typeof error === 'object') {
        // Check if error is an authentication error
        const errorMessage = String(error.message || '');
        const errorCode = String(error.code || '');
        
        // Don't retry auth errors or permission issues
        if (errorCode === '401' || errorCode === '403' || 
            errorMessage.includes('API key') || 
            errorMessage.includes('not authorized')) {
          logger.debug(`Auth error ${errorCode} detected, stopping retries:`, errorMessage);
          break;
        }
        
        // Continue retrying for network/timeout issues
        if (['23', '20', 'ECONNABORTED', 'ETIMEDOUT', '408', '429', '500', '502', '503', '504']
              .some(code => errorCode.includes(code)) ||
            ['timeout', 'network', 'connection', 'unavailable']
              .some(term => errorMessage.toLowerCase().includes(term))) {
          logger.debug(`Recoverable error detected, will retry:`, { errorCode, errorMessage });
          continue;
        }
        
        // For other error types, stop retrying after a couple of attempts
        if (attempt >= 2) {
          logger.debug(`Error code ${errorCode} with multiple failures, stopping retries`);
          break;
        }
      }
    }
  }
  
  logger.error('All retry attempts failed:', lastError);
  throw lastError;
};
