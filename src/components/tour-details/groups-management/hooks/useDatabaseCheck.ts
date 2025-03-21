
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        const { error: createError } = await supabase.rpc('create_participants_table');
        
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
        const { error: createError } = await supabase.rpc('create_tour_groups_table');
        
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
