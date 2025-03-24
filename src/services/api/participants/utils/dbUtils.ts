
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Check if the tour exists in the database with improved error handling and retries
 */
export const checkTourExists = async (tourId: string) => {
  try {
    if (!tourId) {
      logger.error("DATABASE DEBUG: Invalid tourId (empty)");
      return { exists: false, error: "Invalid tour ID" };
    }
    
    // Use retry mechanism with shorter timeout for this specific check
    return await supabaseWithRetry(async () => {
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('id')
        .eq('id', tourId)
        .single();
        
      if (tourError) {
        if (tourError.code === '23' || tourError.code === '20') {
          // Timeout or abort error - these are recoverable with retry
          logger.error("DATABASE DEBUG: Timeout/abort error fetching tour data:", tourError);
          throw tourError; // This will trigger the retry mechanism
        } else {
          // Other errors might indicate the tour doesn't exist
          logger.error("DATABASE DEBUG: Error fetching tour data:", tourError);
          return { exists: false, error: tourError.message };
        }
      }
      
      logger.debug("DATABASE DEBUG: Found tour with ID:", tourData.id);
      return { exists: true, id: tourData.id };
    }, 3); // Reduced max retries to 3 to fail faster for non-existent tours
  } catch (error) {
    logger.error("DATABASE DEBUG: Error in checkTourExists:", error);
    return { exists: false, error: String(error) };
  }
};

/**
 * Debug check participants table using direct SQL with retry mechanism
 * and improved error handling
 */
export const debugCheckParticipantsTable = async (groupIds: string[]) => {
  try {
    if (!groupIds || groupIds.length === 0) {
      logger.warn("DATABASE DEBUG: No group IDs provided for debug check");
      return { 
        success: false, 
        error: "No group IDs provided",
        emptyGroupIds: true 
      };
    }
    
    // Cache results for 30 seconds to prevent excessive checks
    const cacheKey = `debug_participants_${groupIds.join('_')}`;
    const cachedResult = sessionStorage.getItem(cacheKey);
    
    if (cachedResult) {
      const parsedCache = JSON.parse(cachedResult);
      const cacheTime = parsedCache.timestamp || 0;
      
      // Use cache if it's less than 30 seconds old
      if (Date.now() - cacheTime < 30000) {
        logger.debug("DATABASE DEBUG: Using cached participants table check");
        return parsedCache.result;
      }
    }
    
    // Use retry mechanism for more reliable database access
    const result = await supabaseWithRetry(async () => {
      try {
        const { data: directCheck, error: directError } = await supabase.rpc(
          'debug_check_participants',
          { group_ids: groupIds }
        ).single();
        
        if (directError) {
          logger.error("DATABASE DEBUG: Error in debug_check_participants:", directError);
          return { success: false, error: directError.message };
        }
        
        logger.debug("DATABASE DEBUG: Direct SQL check result:", directCheck);
        return { success: true, data: directCheck };
      } catch (innerError) {
        logger.error("DATABASE DEBUG: Exception in debug_check_participants:", innerError);
        return { 
          success: false, 
          error: String(innerError),
          recoverable: false // Signal that we shouldn't retry this operation
        };
      }
    }, 2); // Reduced retries for diagnostic functions
    
    // Cache the result
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        result
      }));
    } catch (cacheError) {
      // Ignore cache errors
    }
    
    return result;
  } catch (error) {
    logger.error("DATABASE DEBUG: Error in debugCheckParticipantsTable:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Utility to handle failures gracefully with fallback data and improved error handling
 */
export const executeWithFallback = async <T>(
  operation: () => Promise<T>,
  fallbackData: T,
  errorMessage: string,
  maxRetries = 1
): Promise<T> => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add small delay before retries
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 300 * attempt));
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      logger.error(`${errorMessage} (attempt ${attempt + 1}/${maxRetries}):`, error);
    }
  }
  
  // All retries failed, return the fallback
  logger.error(`${errorMessage} - all ${maxRetries} retries failed:`, lastError);
  return fallbackData;
};
