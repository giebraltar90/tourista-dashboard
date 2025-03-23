
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDatabaseData = (tourId: string) => {
  const [dbCheckResult, setDbCheckResult] = useState<{
    hasTable: boolean;
    participantCount: number;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const checkDatabase = useCallback(async () => {
    console.log("Checking database for tour:", tourId);
    try {
      // Check if participants table exists
      const { data: tableExistsData, error: tableError } = await supabase
        .rpc('check_table_exists', { table_name: 'participants' });
      
      if (tableError) {
        console.error("Error checking if table exists:", tableError);
        setDbCheckResult({
          hasTable: false,
          participantCount: 0,
          error: tableError.message
        });
        return;
      }
      
      const tableExists = tableExistsData === true;
      
      if (!tableExists) {
        setDbCheckResult({
          hasTable: false,
          participantCount: 0
        });
        return;
      }
      
      // Get tour groups for this tour
      const { data: groupsData, error: groupsError } = await supabase
        .from('tour_groups')
        .select('id')
        .eq('tour_id', tourId);
      
      if (groupsError) {
        console.error("Error fetching tour groups:", groupsError);
        setDbCheckResult({
          hasTable: true,
          participantCount: 0,
          error: groupsError.message
        });
        return;
      }
      
      if (!groupsData || groupsData.length === 0) {
        // No groups found
        setDbCheckResult({
          hasTable: true,
          participantCount: 0
        });
        return;
      }
      
      // Get group IDs
      const groupIds = groupsData.map(group => group.id);
      
      // Count participants for these groups
      const { count, error: countError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .in('group_id', groupIds);
      
      if (countError) {
        console.error("Error counting participants:", countError);
        setDbCheckResult({
          hasTable: true,
          participantCount: 0,
          error: countError.message
        });
        return;
      }
      
      // Set final result
      setDbCheckResult({
        hasTable: true,
        participantCount: count || 0
      });
      
    } catch (error) {
      console.error("Error in database check:", error);
      setDbCheckResult({
        hasTable: false,
        participantCount: 0,
        error: String(error)
      });
    }
  }, [tourId]);
  
  // Initial load
  useEffect(() => {
    if (tourId) {
      setIsLoading(true);
      checkDatabase().finally(() => {
        setIsLoading(false);
      });
    }
  }, [tourId, checkDatabase]);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    checkDatabase()
      .then(() => {
        toast.success("Database check completed");
      })
      .catch(error => {
        toast.error("Failed to check database: " + String(error));
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [checkDatabase]);
  
  return {
    dbCheckResult,
    isLoading,
    isRefreshing,
    handleRefresh
  };
};
