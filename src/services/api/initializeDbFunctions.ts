
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Initialize all required database functions on application startup
 */
export const initializeDbFunctions = async () => {
  try {
    logger.debug("Creating/updating database functions...");
    
    // Create the update_groups_after_move function for atomic group updates
    const { error: moveError } = await supabase.rpc('create_groups_update_function', {});
    
    if (moveError) {
      logger.error("Failed to create update_groups_after_move function:", moveError);
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
 */
export const ensureDbFunctionsExist = () => {
  initializeDbFunctions().then(success => {
    if (success) {
      logger.debug("Database functions initialized successfully");
    } else {
      logger.error("Failed to initialize database functions");
    }
  });
};
