
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkDatabaseConsistency, fixDatabaseIssues } from "@/services/api/databaseConsistencyService";

export const useDatabaseCheck = (tourId: string, onRefresh: () => void) => {
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [isFixingDatabase, setIsFixingDatabase] = useState(false);

  // Function to check and fix database issues
  const handleFixDatabase = useCallback(async () => {
    if (!tourId || isFixingDatabase) return;
    
    setIsFixingDatabase(true);
    
    try {
      const result = await fixDatabaseIssues(tourId);
      
      if (result.success) {
        toast.success("Database issues fixed successfully");
        setDatabaseError(null);
        // Refresh data after fixes
        onRefresh();
      } else {
        toast.error(`Failed to fix database issues: ${result.error}`);
      }
    } catch (error) {
      console.error("Error fixing database:", error);
      toast.error("An error occurred while fixing database issues");
    } finally {
      setIsFixingDatabase(false);
    }
  }, [tourId, isFixingDatabase, onRefresh]);

  return {
    databaseError,
    setDatabaseError,
    isFixingDatabase,
    handleFixDatabase
  };
};
