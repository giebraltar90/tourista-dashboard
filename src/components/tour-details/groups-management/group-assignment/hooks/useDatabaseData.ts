
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
      // Check if the necessary tables exist
      const { data: tourTableExists, error: tourTableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'tours')
        .single();

      const { data: tourGroupsTableExists, error: tourGroupsTableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'tour_groups')
        .single();

      const { data: participantsTableExists, error: participantsTableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'participants')
        .single();

      // If any of the tables don't exist, return error
      if (tourTableError || tourGroupsTableError || participantsTableError) {
        setDbCheckResult({
          tablesExist: false,
          error: 'Required database tables are missing'
        });
        return;
      }

      // Count records in the tables
      const { data: toursCount, error: toursCountError } = await supabase
        .from('tours')
        .select('id', { count: 'exact', head: true });

      const { data: tourGroupsCount, error: tourGroupsCountError } = await supabase
        .from('tour_groups')
        .select('id', { count: 'exact', head: true });

      const { data: participantsData, error: participantsCountError } = await supabase
        .from('participants')
        .select('id', { count: 'exact', head: true });

      if (toursCountError || tourGroupsCountError || participantsCountError) {
        setDbCheckResult({
          tablesExist: true,
          error: 'Could not count records in database tables'
        });
        return;
      }

      setDbCheckResult({
        tablesExist: true,
        error: null,
        toursCount: toursCount?.length ?? 0,
        tourGroupsCount: tourGroupsCount?.length ?? 0,
        participantsCount: participantsData?.length ?? 0
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
