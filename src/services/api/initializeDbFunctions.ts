
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { createSyncTourGroupsFunction } from './db/functions/createSyncTourGroupsFunction';
import { createInvalidateCacheFunction } from './db/functions/createInvalidateCacheFunction';

/**
 * Ensures all required database functions exist
 */
export const ensureDbFunctionsExist = async (): Promise<void> => {
  try {
    logger.debug("Checking and ensuring database functions exist");
    
    // Create the sync_all_tour_groups function
    await createSyncTourGroupsFunction();
    
    // Check if invalidate_tour_cache function exists and create it if needed
    const { data: functionExists, error: checkError } = await supabase.rpc(
      'invalidate_tour_cache',
      { p_tour_id: '00000000-0000-0000-0000-000000000000' } // Dummy ID to check if function exists
    );
    
    if (checkError && checkError.message.includes('does not exist')) {
      logger.debug("Creating invalidate_tour_cache function");
      await createInvalidateCacheFunction();
    }
    
    logger.debug("Database functions check complete");
  } catch (error) {
    logger.error("Error ensuring DB functions exist:", error);
  }
};
