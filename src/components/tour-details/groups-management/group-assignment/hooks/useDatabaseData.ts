
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DatabaseCheckResult {
  tablesExist: boolean;
  participantsCount?: number;
  toursCount?: number;
  tourGroupsCount?: number;
  error?: string;
}

export const useDatabaseData = (tourId: string) => {
  const [dbCheckResult, setDbCheckResult] = useState<DatabaseCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkDatabase = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if tour exists
      const { data: tourData, error: tourError } = await supabase
        .from("tours")
        .select("id")
        .eq("id", tourId)
        .single();

      if (tourError) {
        throw new Error(`Tour check failed: ${tourError.message}`);
      }

      // Get the tour's groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("tour_groups")
        .select("id")
        .eq("tour_id", tourId);

      if (groupsError) {
        throw new Error(`Groups check failed: ${groupsError.message}`);
      }

      const groupIds = groupsData.map(group => group.id);

      // Use RPC function to count participants
      const { data: participantsData, error: participantsError } = await supabase
        .rpc("debug_check_participants", { group_ids: groupIds });

      if (participantsError) {
        throw new Error(`Participants check failed: ${participantsError.message}`);
      }

      setDbCheckResult({
        tablesExist: true,
        participantsCount: participantsData?.participant_count || 0,
        tourGroupsCount: groupIds.length,
        toursCount: 1
      });

    } catch (error: any) {
      console.error("Database check error:", error);
      setDbCheckResult({
        tablesExist: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [tourId]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    checkDatabase().finally(() => {
      setIsRefreshing(false);
      toast.success("Database status refreshed");
    });
  }, [checkDatabase]);

  // Initial check
  useState(() => {
    checkDatabase();
  });

  return {
    dbCheckResult,
    isLoading,
    isRefreshing,
    handleRefresh
  };
};
