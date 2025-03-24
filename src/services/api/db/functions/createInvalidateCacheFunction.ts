
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Create a database function to invalidate tour cache
 */
export const createInvalidateCacheFunction = async (): Promise<boolean> => {
  try {
    logger.debug("Creating invalidate_tour_cache function");
    
    // SQL to create the function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION invalidate_tour_cache(p_tour_id UUID)
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      BEGIN
        -- Delete any cached entries for this tour from the ticket_requirements table
        DELETE FROM ticket_requirements WHERE tour_id = p_tour_id;
        
        -- Refresh the materialized view to ensure latest data
        REFRESH MATERIALIZED VIEW CONCURRENTLY tour_statistics;
        
        -- Return success
        RETURN;
      END;
      $$;
    `;
    
    // Execute the SQL statement
    const { error } = await supabase.rpc('execute_sql', { 
      sql_query: createFunctionSQL 
    });
    
    if (error) {
      logger.error("Error creating invalidate_tour_cache function:", error);
      return false;
    }
    
    logger.debug("invalidate_tour_cache function created successfully");
    return true;
  } catch (error) {
    logger.error("Exception creating invalidate_tour_cache function:", error);
    return false;
  }
};
