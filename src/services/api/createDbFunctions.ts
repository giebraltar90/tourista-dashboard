import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Type definition for the execute_sql parameters
interface ExecuteSqlParams {
  sql_query: string;
}

/**
 * Establishes necessary database functions
 */
export const createDatabaseFunctions = async (): Promise<boolean> => {
  try {
    logger.debug("DATABASE DEBUG: Creating database functions");
    
    // Create execute_sql function to run arbitrary SQL
    const createExecuteSqlFunction = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$;
    `;
    
    // Try to call execute_sql
    try {
      const { error: sqlFunctionError } = await supabase.rpc(
        'execute_sql', 
        { sql_query: createExecuteSqlFunction } as ExecuteSqlParams
      );
      
      if (sqlFunctionError) {
        // Function might not exist yet, try direct SQL
        logger.error("DATABASE DEBUG: Failed to create execute_sql function:", sqlFunctionError);
        logger.debug("DATABASE DEBUG: Function might not exist yet. Please create it manually in the Supabase SQL editor");
        
        // We can't use direct SQL execution in the client, so we'll just log an error
        return false;
      }
    } catch (error) {
      logger.error("DATABASE DEBUG: Exception creating execute_sql function:", error);
      // Continue with other function creation attempts
    }
    
    // Create check_table_exists function with proper parameter naming
    const createCheckTableExistsFunction = `
      CREATE OR REPLACE FUNCTION check_table_exists(table_name_param TEXT)
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      AS $$
      DECLARE
        table_exists BOOLEAN;
      BEGIN
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = table_name_param
        ) INTO table_exists;
        
        RETURN table_exists;
      END;
      $$;
    `;
    
    try {
      const { error: tableCheckFunctionError } = await supabase.rpc(
        'execute_sql',
        { sql_query: createCheckTableExistsFunction } as ExecuteSqlParams
      );
      
      if (tableCheckFunctionError) {
        logger.error("DATABASE DEBUG: Failed to create check_table_exists function:", tableCheckFunctionError);
      } else {
        logger.debug("DATABASE DEBUG: Successfully created/updated check_table_exists function");
      }
    } catch (error) {
      logger.error("DATABASE DEBUG: Exception creating check_table_exists function:", error);
    }
    
    // Create update_tour_guide_assignment function
    const createUpdateTourGuideFunction = `
      CREATE OR REPLACE FUNCTION update_tour_guide_assignment(
        p_tour_id uuid,
        p_guide_field text,
        p_guide_id uuid
      ) 
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      BEGIN
        -- Dynamically construct and execute SQL to update the correct guide field
        IF p_guide_field = 'guide1_id' THEN
          UPDATE public.tours SET guide1_id = p_guide_id WHERE id = p_tour_id;
        ELSIF p_guide_field = 'guide2_id' THEN
          UPDATE public.tours SET guide2_id = p_guide_id WHERE id = p_tour_id;
        ELSIF p_guide_field = 'guide3_id' THEN
          UPDATE public.tours SET guide3_id = p_guide_id WHERE id = p_tour_id;
        END IF;
      END;
      $$;
    `;
    
    try {
      const { error: updateGuideFunctionError } = await supabase.rpc(
        'execute_sql',
        { sql_query: createUpdateTourGuideFunction } as ExecuteSqlParams
      );
      
      if (updateGuideFunctionError) {
        logger.error("DATABASE DEBUG: Failed to create update_tour_guide_assignment function:", updateGuideFunctionError);
      } else {
        logger.debug("DATABASE DEBUG: Successfully created/updated update_tour_guide_assignment function");
      }
    } catch (error) {
      logger.error("DATABASE DEBUG: Exception creating update_tour_guide_assignment function:", error);
    }
    
    // Create debug_check_participants function
    const createDebugCheckParticipantsFunction = `
      CREATE OR REPLACE FUNCTION debug_check_participants(group_ids UUID[])
      RETURNS JSONB
      LANGUAGE plpgsql
      AS $$
      DECLARE
        participant_count INTEGER;
        result JSONB;
      BEGIN
        SELECT COUNT(*) INTO participant_count
        FROM participants
        WHERE group_id = ANY(group_ids);
        
        SELECT jsonb_build_object(
          'table_exists', TRUE,
          'participant_count', participant_count,
          'groups_checked', array_length(group_ids, 1)
        ) INTO result;
        
        RETURN result;
      END;
      $$;
    `;
    
    try {
      const { error: debugFunctionError } = await supabase.rpc(
        'execute_sql',
        { sql_query: createDebugCheckParticipantsFunction } as ExecuteSqlParams
      );
      
      if (debugFunctionError) {
        logger.error("DATABASE DEBUG: Failed to create debug_check_participants function:", debugFunctionError);
      } else {
        logger.debug("DATABASE DEBUG: Successfully created/updated debug_check_participants function");
      }
    } catch (error) {
      logger.error("DATABASE DEBUG: Exception creating debug_check_participants function:", error);
    }
    
    return true;
  } catch (error) {
    logger.error("DATABASE DEBUG: Error creating database functions:", error);
    return false;
  }
};
