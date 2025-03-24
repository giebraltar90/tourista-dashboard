
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const createSyncTourGroupsFunction = async (): Promise<boolean> => {
  try {
    logger.debug("Creating sync_all_tour_groups function in database");
    
    // Create the function that will manually synchronize all tour groups
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION sync_all_tour_groups(p_tour_id UUID)
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      BEGIN
        -- Update all tour groups with calculated sizes from participants
        UPDATE tour_groups tg
        SET 
          size = COALESCE((
            SELECT SUM(p.count) 
            FROM participants p 
            WHERE p.group_id = tg.id
          ), 0),
          child_count = COALESCE((
            SELECT SUM(p.child_count) 
            FROM participants p 
            WHERE p.group_id = tg.id
          ), 0),
          updated_at = NOW()
        WHERE tg.tour_id = p_tour_id;
        
        -- Also refresh the materialized view
        REFRESH MATERIALIZED VIEW CONCURRENTLY tour_statistics;
      END;
      $$;
    `;
    
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: createFunctionQuery
    });
    
    if (error) {
      logger.error("Error creating sync_all_tour_groups function:", error);
      return false;
    }
    
    logger.debug("Successfully created sync_all_tour_groups function");
    return true;
  } catch (error) {
    logger.error("Exception creating sync_all_tour_groups function:", error);
    return false;
  }
};
