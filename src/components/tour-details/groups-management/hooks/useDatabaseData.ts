
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventEmitter } from '@/utils/eventEmitter';

export interface DatabaseCheckResult {
  tablesExist: boolean;
  error: string | null;
  toursCount?: number;
  tourGroupsCount?: number;
  participantsCount?: number;
  bucketAssignmentsCount?: number;
}

export const useDatabaseData = () => {
  const [dbCheckResult, setDbCheckResult] = useState<DatabaseCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const checkDatabaseStatus = useCallback(async (force: boolean = false) => {
    try {
      // Prevent too frequent rechecks
      const now = Date.now();
      if (!force && now - lastRefreshTime < 5000) {
        console.log("DATABASE DEBUG: Skipping database refresh - too soon");
        return;
      }
      
      setLastRefreshTime(now);
      setIsChecking(true);
      
      // Check if tables exist
      const tables = ['participants', 'tour_groups', 'tours', 'bucket_tour_assignments'];
      let allTablesExist = true;
      let errorMessage = null;
      
      // First check if Supabase is connected
      try {
        const { data, error } = await supabase.from('tours').select('count(*)', { count: 'exact', head: true });
        
        if (error) {
          console.error("Database connection error:", error);
          setDbCheckResult({
            tablesExist: false,
            error: `Database connection error: ${error.message}`
          });
          EventEmitter.emit('database-connection-error', { error: error.message });
          return;
        }
      } catch (err) {
        console.error("Failed to connect to database:", err);
        setDbCheckResult({
          tablesExist: false,
          error: "Failed to connect to database"
        });
        EventEmitter.emit('database-connection-error', { error: err instanceof Error ? err.message : String(err) });
        return;
      }
      
      // Count records in each table
      let toursCount = 0;
      let tourGroupsCount = 0;
      let participantsCount = 0;
      let bucketAssignmentsCount = 0;

      // Check tours table
      try {
        const { count: tourCount, error: tourCountError } = await supabase
          .from('tours')
          .select('*', { count: 'exact', head: true });

        if (!tourCountError && tourCount !== null) {
          toursCount = tourCount;
        } else if (tourCountError) {
          allTablesExist = false;
          errorMessage = "Error accessing tours table";
        }
      } catch (err) {
        console.error('Error counting tours:', err);
        allTablesExist = false;
      }

      // Check tour_groups table
      try {
        const { count: groupCount, error: groupCountError } = await supabase
          .from('tour_groups')
          .select('*', { count: 'exact', head: true });

        if (!groupCountError && groupCount !== null) {
          tourGroupsCount = groupCount;
        } else if (groupCountError) {
          allTablesExist = false;
          errorMessage = errorMessage || "Error accessing tour_groups table";
        }
      } catch (err) {
        console.error('Error counting tour groups:', err);
        allTablesExist = false;
      }

      // Check participants table
      try {
        const { count: partCount, error: partCountError } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true });

        if (!partCountError && partCount !== null) {
          participantsCount = partCount;
        } else if (partCountError) {
          allTablesExist = false;
          errorMessage = errorMessage || "Error accessing participants table";
        }
      } catch (err) {
        console.error('Error counting participants:', err);
        allTablesExist = false;
      }
      
      // Check bucket_tour_assignments table
      try {
        const { count: bucketCount, error: bucketCountError } = await supabase
          .from('bucket_tour_assignments')
          .select('*', { count: 'exact', head: true });

        if (!bucketCountError && bucketCount !== null) {
          bucketAssignmentsCount = bucketCount;
        } else if (bucketCountError) {
          // This is non-critical, just log it
          console.warn('Warning: Error accessing bucket_tour_assignments table', bucketCountError);
        }
      } catch (err) {
        console.warn('Warning: Error counting bucket assignments:', err);
      }

      setDbCheckResult({
        tablesExist: allTablesExist,
        error: errorMessage,
        toursCount,
        tourGroupsCount,
        participantsCount,
        bucketAssignmentsCount
      });
      
      // Emit success event
      if (allTablesExist) {
        EventEmitter.emit('database-check-success', {
          toursCount,
          tourGroupsCount,
          participantsCount
        });
      }
      
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbCheckResult({
        tablesExist: false,
        error: 'Error checking database status'
      });
      EventEmitter.emit('database-check-error', { error });
    } finally {
      setIsChecking(false);
    }
  }, [lastRefreshTime]);

  // Initial check on mount
  useEffect(() => {
    checkDatabaseStatus();
    
    // Listen for global database events
    const handleRefreshRequest = () => {
      checkDatabaseStatus(true);
    };
    
    EventEmitter.on('refresh-database-status', handleRefreshRequest);
    
    return () => {
      EventEmitter.off('refresh-database-status', handleRefreshRequest);
    };
  }, [checkDatabaseStatus]);

  const refreshDatabaseStatus = useCallback(() => {
    checkDatabaseStatus(true);
  }, [checkDatabaseStatus]);

  return {
    dbCheckResult,
    refreshDatabaseStatus,
    isChecking
  };
};
