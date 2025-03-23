
import { executeCustomSql } from "@/services/api/customRpc";
import { logger } from "@/utils/logger";

/**
 * Creates the update_groups_after_move stored procedure in the database
 */
export const createGroupsUpdateFunction = async (): Promise<boolean> => {
  try {
    logger.debug("Creating update_groups_after_move function");
    
    // SQL definition for update_groups_after_move function
    const functionSql = `
      CREATE OR REPLACE FUNCTION update_groups_after_move(
        source_group_id UUID,
        target_group_id UUID,
        source_size INT,
        source_child_count INT,
        target_size INT,
        target_child_count INT
      ) RETURNS VOID AS $$
      BEGIN
        -- Update the source group
        UPDATE tour_groups 
        SET 
          size = GREATEST(0, source_size), 
          child_count = GREATEST(0, source_child_count),
          updated_at = NOW()
        WHERE id = source_group_id;
        
        -- Update the target group
        UPDATE tour_groups 
        SET 
          size = target_size, 
          child_count = target_child_count,
          updated_at = NOW()
        WHERE id = target_group_id;
        
        RETURN;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // Execute the SQL to create the function
    const success = await executeCustomSql(functionSql);
    
    if (!success) {
      logger.error("Failed to create update_groups_after_move function");
      return false;
    }
    
    logger.debug("Successfully created update_groups_after_move function");
    return true;
  } catch (error) {
    logger.error("Unexpected error creating update_groups_after_move function:", error);
    return false;
  }
};
