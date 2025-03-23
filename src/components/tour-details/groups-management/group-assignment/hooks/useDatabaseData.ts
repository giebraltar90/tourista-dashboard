
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DatabaseCheckResult {
  tablesExist: boolean;
  error: string | null;
  toursCount?: number;
  tourGroupsCount?: number;
  participantsCount?: number;
}

export const useDatabaseData = () => {
  const [dbCheckResult, setDbCheckResult] = useState<DatabaseCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseStatus = async () => {
    try {
      setIsChecking(true);
      
      // Use a safer approach for checking tables
      const tables = ['participants', 'tour_groups', 'tours'];
      const tableResults = {};
      let allTablesExist = true;
      
      // Check each table individually
      for (const tableName of tables) {
        try {
          // Fix SQL ambiguity by using parameter name that won't conflict
          const { data: exists, error: checkError } = await supabase.rpc('check_table_exists', {
            "p_table_name": tableName
          });
          
          if (checkError) {
            console.error(`Error checking if ${tableName} exists:`, checkError);
            
            // Fallback check by attempting to query the table
            // Use type assertion to satisfy TypeScript
            const { data: fallbackCheck, error: fallbackError } = await supabase
              .from(tableName as any)
              .select('*', { count: 'exact', head: true })
              .limit(1);
              
            tableResults[tableName] = !fallbackError;
            allTablesExist = allTablesExist && !fallbackError;
          } else {
            tableResults[tableName] = exists;
            allTablesExist = allTablesExist && exists;
          }
        } catch (err) {
          console.error(`Error checking ${tableName} table:`, err);
          tableResults[tableName] = false;
          allTablesExist = false;
        }
      }

      // If any tables don't exist, return error
      if (!allTablesExist) {
        setDbCheckResult({
          tablesExist: false,
          error: 'Required database tables are missing'
        });
        return;
      }

      // Count records in each table
      let toursCount = 0;
      let tourGroupsCount = 0;
      let participantsCount = 0;

      try {
        // Count tours - using a hard-coded table name as required by TypeScript
        const { count: tourCount, error: tourCountError } = await supabase
          .from('tours')
          .select('*', { count: 'exact', head: true });

        if (!tourCountError && tourCount !== null) {
          toursCount = tourCount;
        }
      } catch (err) {
        console.error('Error counting tours:', err);
      }

      try {
        // Count tour groups - using a hard-coded table name
        const { count: groupCount, error: groupCountError } = await supabase
          .from('tour_groups')
          .select('*', { count: 'exact', head: true });

        if (!groupCountError && groupCount !== null) {
          tourGroupsCount = groupCount;
        }
      } catch (err) {
        console.error('Error counting tour groups:', err);
      }

      try {
        // Count participants - using a hard-coded table name
        const { count: partCount, error: partCountError } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true });

        if (!partCountError && partCount !== null) {
          participantsCount = partCount;
        }
      } catch (err) {
        console.error('Error counting participants:', err);
      }

      setDbCheckResult({
        tablesExist: true,
        error: null,
        toursCount,
        tourGroupsCount,
        participantsCount
      });
      
      // Show a toast if there's no data
      if (toursCount === 0) {
        toast.info("No tours found. You may want to create test data.");
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbCheckResult({
        tablesExist: false,
        error: 'Error checking database status'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const refreshDatabaseStatus = () => {
    checkDatabaseStatus();
  };

  return {
    dbCheckResult,
    refreshDatabaseStatus,
    isChecking
  };
};
