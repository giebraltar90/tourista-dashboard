
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { createGroupsUpdateFunction } from "./db/functions/createGroupsUpdateFunction";

/**
 * Initialize all required database functions on application startup
 */
export const initializeDbFunctions = async () => {
  try {
    logger.debug("Creating/updating database functions...");
    
    // Create the update_groups_after_move function for atomic group updates
    const success = await createGroupsUpdateFunction();
    
    if (!success) {
      logger.error("Failed to create update_groups_after_move function");
    } else {
      logger.debug("Successfully created/updated update_groups_after_move function");
    }
    
    return true;
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
