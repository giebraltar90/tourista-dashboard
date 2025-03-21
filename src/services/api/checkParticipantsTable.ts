
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to check if the participants table exists and contains data
 */
export const checkParticipantsTable = async () => {
  console.log("DATABASE DEBUG: Checking participants table existence");
  
  try {
    // Try to get the definition of the participants table
    const { data: tableExists, error: definitionError } = await supabase
      .rpc('check_table_exists', { 
        table_name: 'participants' 
      });
    
    if (definitionError) {
      console.error("DATABASE DEBUG: Error checking table definition:", definitionError);
      
      // Fall back to a simple query to see if we can access the table
      const { data: fallbackCheck, error: fallbackError } = await supabase
        .from('participants')
        .select('count(*)', { count: 'exact', head: true });
        
      if (fallbackError) {
        console.error("DATABASE DEBUG: Fallback check failed:", fallbackError);
        return {
          exists: false,
          error: fallbackError.message,
          message: "The participants table does not appear to exist in the database"
        };
      }
      
      return {
        exists: true,
        records: 0,
        message: "Table exists but couldn't check record count"
      };
    }
    
    // If tableExists is false, the table doesn't exist
    if (!tableExists) {
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
