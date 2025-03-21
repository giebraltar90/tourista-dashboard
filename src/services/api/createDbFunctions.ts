
import { supabase } from "@/integrations/supabase/client";

// Type definition for the execute_sql parameters
interface ExecuteSqlParams {
  sql_query: string;
}

/**
 * Establishes necessary database functions
 */
export const createDatabaseFunctions = async (): Promise<boolean> => {
  try {
    console.log("DATABASE DEBUG: Creating database functions");
    
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
        console.error("DATABASE DEBUG: Failed to create execute_sql function:", sqlFunctionError);
        console.log("DATABASE DEBUG: Function might not exist yet. Please create it manually in the Supabase SQL editor");
        
        // We can't use direct SQL execution in the client, so we'll just log an error
        return false;
      }
    } catch (error) {
      console.error("DATABASE DEBUG: Exception creating execute_sql function:", error);
      // Continue with other function creation attempts
    }
    
    // Create check_table_exists function with improved query
    const createCheckTableExistsFunction = `
      CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      AS $$
      DECLARE
        table_exists BOOLEAN;
      BEGIN
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = $1
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
        console.error("DATABASE DEBUG: Failed to create check_table_exists function:", tableCheckFunctionError);
      } else {
        console.log("DATABASE DEBUG: Successfully created/updated check_table_exists function");
      }
    } catch (error) {
      console.error("DATABASE DEBUG: Exception creating check_table_exists function:", error);
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
        console.error("DATABASE DEBUG: Failed to create debug_check_participants function:", debugFunctionError);
      } else {
        console.log("DATABASE DEBUG: Successfully created/updated debug_check_participants function");
      }
    } catch (error) {
      console.error("DATABASE DEBUG: Exception creating debug_check_participants function:", error);
    }
    
    return true;
  } catch (error) {
    console.error("DATABASE DEBUG: Error creating database functions:", error);
    return false;
  }
};
