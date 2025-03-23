
import { useState, useEffect } from "react";
import { checkParticipantsTable } from "@/services/api/checkParticipantsTable";

export const useDatabaseData = (tourId: string) => {
  const [dbCheckResult, setDbCheckResult] = useState<{
    hasTable: boolean;
    participantCount: number;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check database status on component mount and when tourId changes
  useEffect(() => {
    if (tourId) {
      setIsLoading(true);
      checkDatabase();
    }
  }, [tourId]);

  // Function to check database status
  const checkDatabase = async () => {
    try {
      const result = await checkParticipantsTable(tourId);
      // Map the API response to our state format
      setDbCheckResult({
        hasTable: result.exists,
        participantCount: result.records || 0,
        error: result.error
      });
    } catch (error) {
      console.error("Error checking database:", error);
      setDbCheckResult({
        hasTable: false,
        participantCount: 0,
        error: error instanceof Error ? error.message : "Unknown error checking database"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh database status
  const handleRefresh = async () => {
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
