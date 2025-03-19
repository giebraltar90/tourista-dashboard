
import { useState, useEffect, useRef, useCallback } from "react";
import { useTourById } from "@/hooks/tourData";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export function useTourDetailsData(tourId: string) {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const lastRefetchTime = useRef(Date.now());
  
  // First, get the tour data
  const { data: tour, isLoading, error, refetch } = useTourById(tourId);
  
  // Handle refetching tour data
  const handleRefetch = useCallback(() => {
    if (tourId) {
      console.log("Manually refreshing tour data");
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      refetch().catch(err => {
        console.error("Error refetching tour:", err);
        toast({
          title: "Refresh failed",
          description: "Failed to refresh tour data. Please try again.",
          variant: "destructive"
        });
      });
      lastRefetchTime.current = Date.now();
    }
  }, [tourId, queryClient, refetch]);
  
  // Handle tab changes
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    
    const now = Date.now();
    if (now - lastRefetchTime.current > 30000) { 
      console.log("Tab changed, refreshing data after long timeout");
      handleRefetch();
    }
  }, [handleRefetch]);
  
  // Initial load effect
  useEffect(() => {
    if (tourId && isInitialLoad.current) {
      console.log("Initial load, invalidating queries for tour:", tourId);
      handleRefetch();
      isInitialLoad.current = false;
    }
    
    // Cleanup function
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [tourId, handleRefetch]);
  
  // Set up the periodic refresh timer
  useEffect(() => {
    if (!tourId) return;
    
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
    
    refreshTimer.current = setInterval(() => {
      const now = Date.now();
      if (now - lastRefetchTime.current > 120000) {
        console.log("Periodic refresh triggered after long inactivity");
        handleRefetch();
      }
    }, 300000); // 5 minutes
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [tourId, handleRefetch]);

  // All guide data processing moved to the parent component to avoid hook order issues
  return {
    tour,
    isLoading,
    error,
    activeTab,
    handleTabChange,
    handleRefetch
  };
}
