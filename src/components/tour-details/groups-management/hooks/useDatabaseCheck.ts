
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type definition for the execute_sql parameters
interface ExecuteSqlParams {
  sql_query: string;
}

export const useDatabaseCheck = (tourId: string, refreshCallback: () => void) => {
  const [databaseError, setDatabaseError] = useState<string | undefined>(undefined);
  const [isFixingDatabase, setIsFixingDatabase] = useState(false);
  
  const handleFixDatabase = async () => {
    if (!tourId) return;
    
    setIsFixingDatabase(true);
    try {
      console.log("Checking database for necessary tables...");
      
      // Check if the participants table exists
      const { error: participantsError } = await supabase
        .from('participants')
        .select('id')
        .limit(1);
        
      if (participantsError) {
        // Create the participants table if it doesn't exist
        console.log("Creating participants table...");
        const createParticipantsTableSQL = `
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
        
        const { error: createError } = await supabase.rpc(
          'execute_sql', 
          { sql_query: createParticipantsTableSQL } as ExecuteSqlParams
        );
        
        if (createError) {
          console.error("Error creating participants table:", createError);
          toast.error("Failed to create participants table");
          return;
        }
      }
      
      // Check if the tour_groups table exists
      const { error: groupsError } = await supabase
        .from('tour_groups')
        .select('id')
        .limit(1);
        
      if (groupsError) {
        // Create the tour_groups table if it doesn't exist
        console.log("Creating tour_groups table...");
        const createTourGroupsTableSQL = `
          CREATE TABLE IF NOT EXISTS public.tour_groups (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            size INTEGER NOT NULL DEFAULT 0,
            child_count INTEGER DEFAULT 0,
            tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
            guide_id UUID REFERENCES public.guides(id),
            entry_time TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Make sure the tour_groups table has the proper permissions
          ALTER TABLE IF EXISTS public.tour_groups ENABLE ROW LEVEL SECURITY;
          
          -- Grant access to anon and authenticated users
          GRANT SELECT, INSERT, UPDATE, DELETE ON public.tour_groups TO anon, authenticated;
        `;
        
        const { error: createError } = await supabase.rpc(
          'execute_sql', 
          { sql_query: createTourGroupsTableSQL } as ExecuteSqlParams
        );
        
        if (createError) {
          console.error("Error creating tour_groups table:", createError);
          toast.error("Failed to create tour_groups table");
          return;
        }
      }
      
      // Clear any database errors
      setDatabaseError(undefined);
      toast.success("Database fixed successfully");
      
      // Refresh participants
      refreshCallback();
    } catch (error) {
      console.error("Error fixing database:", error);
      toast.error("Failed to fix database");
    } finally {
      setIsFixingDatabase(false);
    }
  };
  
  return {
    databaseError,
    setDatabaseError,
    isFixingDatabase,
    handleFixDatabase
  };
};
