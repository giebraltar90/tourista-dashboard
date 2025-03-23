
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseCheckResult {
  hasTable: boolean;
  participantCount: number;
  error?: string;
}

export const useDatabaseData = (tourId: string) => {
  const [dbCheckResult, setDbCheckResult] = useState<DatabaseCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to check database and load participant counts
  const checkDatabase = async () => {
    try {
      // Check if the participants table exists
      const { data: tableExists } = await supabase.rpc('check_table_exists', {
        table_name: 'participants'
      });

      if (!tableExists) {
        setDbCheckResult({
          hasTable: false,
          participantCount: 0
        });
        return;
      }

      // Get all tour groups for this tour
      const { data: tourGroups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('id')
        .eq('tour_id', tourId);

      if (groupsError) {
        setDbCheckResult({
          hasTable: true,
          participantCount: 0,
          error: `Error fetching tour groups: ${groupsError.message}`
        });
        return;
      }

      // Extract group IDs
      const groupIds = tourGroups.map(group => group.id);

      // Count participants for these groups
      const { data: participantCount, error: countError } = await supabase
        .from('participants')
        .select('id', { count: 'exact' })
        .in('group_id', groupIds);

      if (countError) {
        setDbCheckResult({
          hasTable: true,
          participantCount: 0,
          error: `Error counting participants: ${countError.message}`
        });
        return;
      }

      setDbCheckResult({
        hasTable: true,
        participantCount: participantCount.length
      });
    } catch (error) {
      setDbCheckResult({
        hasTable: false,
        participantCount: 0,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  // Initial check
  useEffect(() => {
    if (tourId) {
      setIsLoading(true);
      checkDatabase().finally(() => setIsLoading(false));
    }
  }, [tourId]);

  // Function to manually refresh database status
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    await checkDatabase();
    setIsRefreshing(false);
  };

  return {
    dbCheckResult,
    isLoading,
    isRefreshing,
    handleRefresh
  };
};
