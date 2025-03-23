
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to check if the participants table exists and contains data
 */
export const checkParticipantsTable = async () => {
  console.log("DATABASE DEBUG: Checking participants table existence");
  
  try {
    // Use the database function to check if the table exists
    // Update parameter name to match the function's updated parameter
    const { data: tableExists, error: tableCheckError } = await supabase
      .rpc('check_table_exists', { 
        table_name_param: 'participants'
      });
      
    if (tableCheckError) {
      console.error("DATABASE DEBUG: Error using check_table_exists function:", tableCheckError);
      
      // Fall back to a direct query to check if the table exists
      const { data: fallbackCheck, error: fallbackError } = await supabase
        .from('participants')
        .select('id')
        .limit(1);
        
      if (fallbackError) {
        if (fallbackError.code === '42P01') {
          // This specific error code means relation doesn't exist
          console.error("DATABASE DEBUG: Participants table does not exist (confirmed by error code)");
          return {
            exists: false,
            error: "Table does not exist",
            message: "The participants table does not exist in the database"
          };
        } else {
          console.error("DATABASE DEBUG: Other error checking table:", fallbackError);
          // Maybe the table exists but we can't query it for other reasons
          return {
            exists: false,
            error: fallbackError.message,
            message: "Error checking participants table"
          };
        }
      }
      
      // If no error from the fallback, the table exists
      return {
        exists: true,
        records: 0,
        message: "Table exists but couldn't check record count"
      };
    }
    
    // If tableExists is false, the table doesn't exist
    if (!tableExists) {
      console.log("DATABASE DEBUG: check_table_exists returned false");
      return {
        exists: false,
        message: "The participants table does not exist in the database"
      };
    }
    
    // Count records in the participants table
    const { count, error: countError } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("DATABASE DEBUG: Error counting participants:", countError);
      return {
        exists: true,
        records: 0,
        error: countError.message,
        message: "Table exists but couldn't count records"
      };
    }
    
    console.log(`DATABASE DEBUG: Found ${count || 0} participants in the table`);
    return {
      exists: true,
      records: count || 0,
      message: `Participants table exists with ${count} records`
    };
  } catch (error) {
    console.error("DATABASE DEBUG: Exception checking participants table:", error);
    return {
      exists: false,
      error: String(error),
      message: "Error checking participants table"
    };
  }
};
