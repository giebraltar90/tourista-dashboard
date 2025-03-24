
import { createInvalidateCacheFunction } from "./functions/createInvalidateCacheFunction";
import { createSyncTourGroupsFunction } from "./functions/createSyncTourGroupsFunction";
import { logger } from "@/utils/logger";

/**
 * Initialize database functions on application startup
 */
export const initializeDatabaseFunctions = async (): Promise<boolean> => {
  try {
    logger.debug("Initializing database functions");
    
    // Create the sync_all_tour_groups function
    await createSyncTourGroupsFunction();
    
    // Create the invalidate_tour_cache function
    await createInvalidateCacheFunction();
    
    logger.debug("Database functions initialized successfully");
    return true;
  } catch (error) {
    logger.error("Error initializing database functions:", error);
    return false;
  }
};
