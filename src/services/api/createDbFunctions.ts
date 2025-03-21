
import { supabase } from "@/integrations/supabase/client";

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
    
    const { error: sqlFunctionError } = await supabase.rpc(
      'execute_sql', 
      { sql_query: createExecuteSqlFunction } as { sql_query: string }
    );
    
    if (sqlFunctionError) {
      // Function might not exist yet, try direct SQL
      console.error("DATABASE DEBUG: Failed to create execute_sql function:", sqlFunctionError);
      console.log("DATABASE DEBUG: Function might not exist yet. Please create it manually in the Supabase SQL editor");
      
      // We can't use direct SQL execution in the client, so we'll just log an error
      return false;
    }
    
    // Create check_table_exists function
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
    
    const { error: tableCheckFunctionError } = await supabase.rpc(
      'execute_sql',
      { sql_query: createCheckTableExistsFunction } as { sql_query: string }
    );
    
    if (tableCheckFunctionError) {
      console.error("DATABASE DEBUG: Failed to create check_table_exists function:", tableCheckFunctionError);
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
    
    const { error: debugFunctionError } = await supabase.rpc(
      'execute_sql',
      { sql_query: createDebugCheckParticipantsFunction } as { sql_query: string }
    );
    
    if (debugFunctionError) {
      console.error("DATABASE DEBUG: Failed to create debug_check_participants function:", debugFunctionError);
    }
    
    return true;
  } catch (error) {
    console.error("DATABASE DEBUG: Error creating database functions:", error);
    return false;
  }
};
