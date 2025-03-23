
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseCheckResult {
  tablesExist: boolean;
  error: string | null;
  toursCount?: number;
  tourGroupsCount?: number;
  participantsCount?: number;
}

export const useDatabaseData = () => {
  const [dbCheckResult, setDbCheckResult] = useState<DatabaseCheckResult | null>(null);

  const checkDatabaseStatus = async () => {
    try {
      // Use a safer approach - direct RPC function call to check tables
      const { data: checkResult, error: checkError } = await supabase.rpc('check_table_exists', {
        table_name: 'participants'
      });

      if (checkError) {
        console.error('Error checking table existence:', checkError);
        setDbCheckResult({
          tablesExist: false,
          error: 'Error checking table existence'
        });
        return;
      }

      const participantsExists = checkResult === true;

      // Check if tour_groups table exists
      const { data: tourGroupsExists, error: tourGroupsError } = await supabase.rpc('check_table_exists', {
        table_name: 'tour_groups'
      });

      if (tourGroupsError) {
        console.error('Error checking tour_groups table:', tourGroupsError);
        setDbCheckResult({
          tablesExist: false,
          error: 'Error checking tour_groups table'
        });
        return;
      }

      // Check if tours table exists
      const { data: toursExists, error: toursError } = await supabase.rpc('check_table_exists', {
        table_name: 'tours'
      });

      if (toursError) {
        console.error('Error checking tours table:', toursError);
        setDbCheckResult({
          tablesExist: false,
          error: 'Error checking tours table'
        });
        return;
      }

      // If any tables don't exist, return error
      if (!participantsExists || !tourGroupsExists || !toursExists) {
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

      // Count tours
      const { count: tourCount, error: tourCountError } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true });

      if (!tourCountError && tourCount !== null) {
        toursCount = tourCount;
      }

      // Count tour groups
      const { count: groupCount, error: groupCountError } = await supabase
        .from('tour_groups')
        .select('*', { count: 'exact', head: true });

      if (!groupCountError && groupCount !== null) {
        tourGroupsCount = groupCount;
      }

      // Count participants
      const { count: partCount, error: partCountError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true });

      if (!partCountError && partCount !== null) {
        participantsCount = partCount;
      }

      setDbCheckResult({
        tablesExist: true,
        error: null,
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
    refreshDatabaseStatus
  };
};
