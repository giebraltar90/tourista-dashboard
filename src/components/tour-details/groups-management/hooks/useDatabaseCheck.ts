
import { useState, useCallback, useEffect } from "react";
import { checkParticipantsTable } from "@/services/api/checkParticipantsTable";
import { autoFixDatabaseIssues } from "@/services/api/checkDatabaseTables";
import { toast } from "sonner";
import { checkDatabaseConnection } from "@/integrations/supabase/client";

/**
 * Hook to check the database and fix any issues
 */
export const useDatabaseCheck = (tourId: string, refreshParticipants: () => void) => {
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [isFixingDatabase, setIsFixingDatabase] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  
  // Check database status with network error handling
  const checkDatabaseStatus = useCallback(async () => {
    try {
      console.log("DATABASE DEBUG: Checking database status...");
      const now = Date.now();
      
      // Prevent excessive checks (no more than once per 5 seconds)
      if (now - lastCheckTime < 5000) {
        console.log("DATABASE DEBUG: Skipping check, too soon since last check");
        return;
      }
      
      setLastCheckTime(now);
      
      // First check database connectivity
      const connectionCheck = await checkDatabaseConnection();
      if (!connectionCheck.connected) {
        console.error("DATABASE DEBUG: Database connection failed:", connectionCheck.error);
        setDatabaseError(`Database connection error: ${connectionCheck.error}`);
        return;
      }
      
      // Check participants table
      const tableCheck = await checkParticipantsTable();
      console.log("DATABASE DEBUG: Participants table check result:", tableCheck);
      
      if (!tableCheck.exists) {
        console.error("DATABASE DEBUG: Participants table doesn't exist:", tableCheck.message);
        setDatabaseError(tableCheck.message);
      } else {
        setDatabaseError(null);
      }
    } catch (error) {
      console.error("DATABASE DEBUG: Error checking database status:", error);
      setDatabaseError("Error checking database status. Please try again.");
    }
  }, [lastCheckTime]);
  
  // Automatically check database status on mount
  useEffect(() => {
    checkDatabaseStatus();
  }, [checkDatabaseStatus]);
  
  // Fix database issues
  const handleFixDatabase = useCallback(async () => {
    setIsFixingDatabase(true);
    
    try {
      console.log("DATABASE DEBUG: Attempting to fix database issues...");
      
      const success = await autoFixDatabaseIssues();
      
      if (success) {
        console.log("DATABASE DEBUG: Successfully fixed database issues");
        toast.success("Successfully fixed database issues");
        setDatabaseError(null);
        
        // Refresh participants after fixing the database
        refreshParticipants();
      } else {
        console.error("DATABASE DEBUG: Failed to fix database issues");
        toast.error("Failed to fix database issues. Please contact support.");
        setDatabaseError("Failed to fix database issues");
      }
    } catch (error) {
      console.error("DATABASE DEBUG: Error fixing database issues:", error);
      toast.error("Error fixing database issues. Please contact support.");
      setDatabaseError("Error fixing database issues");
    } finally {
      setIsFixingDatabase(false);
    }
  }, [refreshParticipants]);
  
  return { databaseError, isFixingDatabase, handleFixDatabase, checkDatabaseStatus };
};
