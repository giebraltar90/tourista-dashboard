
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { autoFixDatabaseIssues } from "@/services/api/checkDatabaseTables";
import { createTestParticipants } from "@/services/api/createParticipants";
import { toast } from "sonner";

export const useDatabaseCheck = (tourId: string, refreshParticipants: () => void) => {
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [isFixingDatabase, setIsFixingDatabase] = useState(false);
  const hasCheckedRef = useRef(false);
  
  // Check database table existence
  useEffect(() => {
    // Only run once per component lifecycle
    if (hasCheckedRef.current) return;
    
    const checkTableExistence = async () => {
      try {
        hasCheckedRef.current = true;
        
        // Try to directly query the participants table
        const { error } = await supabase
          .from('participants')
          .select('count(*)', { count: 'exact', head: true });
          
        if (error) {
          console.error("DATABASE DEBUG: Error checking participants table:", error);
          
          if (error.code === '42P01') { // relation doesn't exist error
            setDatabaseError("The participants table does not exist in the database. Click 'Fix Database' to create it.");
          } else {
            setDatabaseError(`Database error: ${error.message}`);
          }
        } else {
          setDatabaseError(null);
        }
      } catch (error) {
        console.error("DATABASE DEBUG: Exception checking participants table:", error);
      }
    };
    
    checkTableExistence();
  }, []);
  
  // Handle database fix
  const handleFixDatabase = async () => {
    if (isFixingDatabase) return; // Prevent multiple simultaneous fixes
    
    setIsFixingDatabase(true);
    try {
      const success = await autoFixDatabaseIssues();
      if (success) {
        toast.success("Database issues have been fixed");
        setDatabaseError(null);
        
        // Attempt to add test participants for all groups after fixing the database
        if (tourId) {
          await createTestParticipants(tourId);
          toast.success("Created test participants");
        }
        
        // Refresh participants after fixing the database
        setTimeout(() => {
          refreshParticipants();
        }, 1000);
      } else {
        toast.error("Could not fix database issues");
      }
    } catch (error) {
      console.error("Error fixing database:", error);
      toast.error("Error while fixing database");
    } finally {
      setIsFixingDatabase(false);
    }
  };

  return {
    databaseError,
    isFixingDatabase,
    handleFixDatabase
  };
};
