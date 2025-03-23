
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the participants table exists and get record count
 */
export const checkParticipantsTable = async () => {
  try {
    // Use the database function to check if the table exists
    const { data: tableExists, error: tableError } = await supabase.rpc(
      'check_table_exists',
      { table_name_param: 'participants' }
    );
    
    if (tableError) {
      console.error("DATABASE DEBUG: Error checking participants table:", tableError);
      
      // Fallback method if the function call fails
      try {
        const { data: fallbackCheck, error: fallbackError } = await supabase
          .from('participants')
          .select('count(*)', { count: 'exact', head: true });
          
        if (fallbackError) {
          console.error("DATABASE DEBUG: Fallback check failed:", fallbackError);
          return { 
            exists: false,
            records: 0,
            message: "Participants table does not exist"
          };
        }
        
        return { 
          exists: true,
          records: 0,
          message: "Participants table exists but count check failed"
        };
      } catch (innerError) {
        return { 
          exists: false,
          records: 0,
          message: `Participants table check failed: ${innerError instanceof Error ? innerError.message : 'Unknown error'}`
        };
      }
    }
    
    if (!tableExists) {
      return { 
        exists: false,
        records: 0,
        message: "Participants table does not exist"
      };
    }
    
    // Count records in participants table
    try {
      const { count, error: countError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("DATABASE DEBUG: Error counting participants:", countError);
        return { 
          exists: true,
          records: 0,
          message: "Participants table exists but count query failed"
        };
      }
      
      console.log(`DATABASE DEBUG: Found ${count} participants in the table`);
      return { 
        exists: true,
        records: count || 0,
        message: `Participants table exists with ${count || 0} records`
      };
    } catch (countErr) {
      console.error("DATABASE DEBUG: Exception counting participants:", countErr);
      return { 
        exists: true,
        records: 0,
        message: "Participants table exists but count failed"
      };
    }
  } catch (error) {
    console.error("DATABASE DEBUG: Error in checkParticipantsTable:", error);
    return { 
      exists: false,
      records: 0,
      message: `Error checking participants table: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
