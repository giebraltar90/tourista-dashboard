
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { createSyncTourGroupsFunction } from './db/functions/createSyncTourGroupsFunction';

/**
 * Ensures all required database functions exist
 */
export const ensureDbFunctionsExist = async (): Promise<void> => {
  try {
    logger.debug("Checking and ensuring database functions exist");
    
    // Create the sync_all_tour_groups function
    await createSyncTourGroupsFunction();
    
    logger.debug("Database functions check complete");
  } catch (error) {
    logger.error("Error ensuring DB functions exist:", error);
  }
}
