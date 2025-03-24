
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { createGroupsUpdateFunction } from "./db/functions/createGroupsUpdateFunction";
import { createSyncTourGroupsFunction } from "./db/functions/createSyncTourGroupsFunction";

/**
 * Initialize all required database functions on application startup
 */
export const initializeDbFunctions = async () => {
  try {
    logger.debug("Creating/updating database functions...");
    
    // Create the update_groups_after_move function for atomic group updates
    const updateSuccess = await createGroupsUpdateFunction();
    
    if (!updateSuccess) {
      logger.error("Failed to create update_groups_after_move function");
    } else {
      logger.debug("Successfully created/updated update_groups_after_move function");
    }
    
    // Create the sync_all_tour_groups function
    const syncSuccess = await createSyncTourGroupsFunction();
    
    if (!syncSuccess) {
      logger.error("Failed to create sync_all_tour_groups function");
    } else {
      logger.debug("Successfully created/updated sync_all_tour_groups function");
    }
    
    return updateSuccess && syncSuccess;
  } catch (error) {
    logger.error("Error initializing database functions:", error);
    return false;
  }
};

/**
 * Execute this function on app startup to ensure the DB functions are created
 * Returns a Promise so it can be properly handled with catch()
 */
export const ensureDbFunctionsExist = async (): Promise<boolean> => {
  return initializeDbFunctions().then(success => {
    if (success) {
      logger.debug("Database functions initialized successfully");
    } else {
      logger.error("Failed to initialize database functions");
    }
    return success;
  });
};
