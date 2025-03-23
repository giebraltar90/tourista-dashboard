
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Executes a SQL query using the execute_sql RPC function
 */
export const executeCustomSql = async (sqlQuery: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: sqlQuery
    });
    
    if (error) {
      logger.error("Error executing custom SQL:", error);
      return false;
    }
    
    logger.debug("Successfully executed custom SQL");
    return true;
  } catch (error) {
    logger.error("Unexpected error executing custom SQL:", error);
    return false;
  }
};
