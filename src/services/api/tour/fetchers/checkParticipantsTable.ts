
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Check if the participants table exists with more detailed error reporting
 */
export const checkParticipantsTable = async () => {
  try {
    logger.debug("Checking if participants table exists...");
    
    // Method 1: Use database function
    try {
      const { data: tableExists, error } = await supabase.rpc(
        'check_table_exists',
        { table_name_param: 'participants' }
      );
      
      if (!error) {
        logger.debug(`RPC check result for participants table: ${tableExists}`);
        return { exists: tableExists, message: tableExists ? "Table exists" : "Table does not exist" };
      }
      
      logger.warn("RPC check failed, falling back to direct query:", error);
    } catch (rpcError) {
      logger.warn("Error checking table via RPC:", rpcError);
    }
    
    // Method 2: Try a simple query (fallback)
    try {
      const { error } = await supabase
        .from('participants')
        .select('id')
        .limit(1);
      
      // If there's no error, the table exists
      if (!error) {
        logger.debug("Direct query shows participants table exists");
        return { exists: true, message: "Table exists (verified by query)" };
      }
      
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01' || error.message.includes('relation "participants" does not exist')) {
        logger.debug("Participants table does not exist");
        return { exists: false, message: "Table does not exist" };
      }
      
      // Some other error occurred
      logger.warn("Error querying participants table:", error);
      return { exists: false, message: `Query error: ${error.message}` };
    } catch (queryError) {
      logger.error("Exception checking participants table:", queryError);
      return { exists: false, message: `Exception: ${queryError instanceof Error ? queryError.message : String(queryError)}` };
    }
  } catch (error) {
    logger.error("Unexpected error in checkParticipantsTable:", error);
    return { exists: false, message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` };
  }
};
