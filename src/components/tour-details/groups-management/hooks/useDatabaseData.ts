
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
      
      // Check if tables exist
      const tables = ['participants', 'tour_groups', 'tours'];
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
          return;
        }
      } catch (err) {
        console.error("Failed to connect to database:", err);
        setDbCheckResult({
          tablesExist: false,
          error: "Failed to connect to database"
        });
        return;
      }
      
      // Count records in each table
      let toursCount = 0;
      let tourGroupsCount = 0;
      let participantsCount = 0;

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

      setDbCheckResult({
        tablesExist: allTablesExist,
        error: errorMessage,
        toursCount,
        tourGroupsCount,
        participantsCount
      });
      
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
