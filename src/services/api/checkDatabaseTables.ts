
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createDatabaseFunctions } from "./createDbFunctions";

// Type definition for the execute_sql parameters
interface ExecuteSqlParams {
  sql_query: string;
}

/**
 * Creates the participants table if it doesn't exist
 */
export const createParticipantsTableIfNeeded = async (): Promise<boolean> => {
  try {
    console.log("DATABASE DEBUG: Checking if participants table needs to be created");
    
    // First check if the table exists using the updated parameter name
    const { data: tableExists, error: tableCheckError } = await supabase
      .rpc('check_table_exists', { 
        table_name_param: 'participants' 
      });
      
    // If there's no error and tableExists is true, the table exists
    if (!tableCheckError && tableExists === true) {
      console.log("DATABASE DEBUG: Participants table already exists");
      return true;
    }
    
    console.log("DATABASE DEBUG: Table check result:", { tableExists, error: tableCheckError });
    console.log("DATABASE DEBUG: Attempting to create participants table");
    
    // Create participants table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        count INTEGER DEFAULT 1,
        child_count INTEGER DEFAULT 0,
        group_id UUID REFERENCES public.tour_groups(id) ON DELETE CASCADE,
        booking_ref TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      -- Make sure the participants table has the proper permissions
      ALTER TABLE IF EXISTS public.participants ENABLE ROW LEVEL SECURITY;
      
      -- Grant access to anon and authenticated users
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants TO anon, authenticated;
    `;
    
    // Call the execute_sql function
    const { error: createError } = await supabase.rpc(
      'execute_sql', 
      { sql_query: createTableSQL } as ExecuteSqlParams
    );
    
    if (createError) {
      console.error("DATABASE DEBUG: Failed to create participants table:", createError);
      toast.error("Failed to create participants table. Please contact support.");
      return false;
    }
    
    console.log("DATABASE DEBUG: Successfully created participants table");
    toast.success("Created participants table in the database");
    return true;
  } catch (error) {
    console.error("DATABASE DEBUG: Error in createParticipantsTableIfNeeded:", error);
    return false;
  }
};

/**
 * Attempts to auto-fix database issues
 */
export const autoFixDatabaseIssues = async (): Promise<boolean> => {
  try {
    console.log("DATABASE DEBUG: Running database auto-fix routine");
    
    // First make sure we have all the necessary functions
    await createDatabaseFunctions();
    
    // Attempt to create the participants table if needed
    const tableCreated = await createParticipantsTableIfNeeded();
    
    if (!tableCreated) {
      console.error("DATABASE DEBUG: Could not create participants table");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("DATABASE DEBUG: Error in autoFixDatabaseIssues:", error);
    return false;
  }
};
