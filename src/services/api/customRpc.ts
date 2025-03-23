
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Creates the update_groups_after_move stored procedure in the database
 */
export const createUpdateGroupsFunction = async () => {
  try {
    // Using a raw SQL query to create the function
    const { error } = await supabase.rpc('create_groups_update_function');
    
    if (error) {
      logger.error("Error creating update_groups_after_move function:", error);
      return false;
    }
    
    logger.debug("Successfully created update_groups_after_move function");
    return true;
  } catch (error) {
    logger.error("Unexpected error creating function:", error);
    return false;
  }
};
