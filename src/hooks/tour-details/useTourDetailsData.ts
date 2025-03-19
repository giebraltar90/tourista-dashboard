
import { useState, useEffect, useRef, useCallback } from "react";
import { useTourById } from "@/hooks/tourData";
import { useGuideInfo } from "@/hooks/guides";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export function useTourDetailsData(tourId: string) {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const lastRefetchTime = useRef(Date.now());
  
  const { data: tour, isLoading, error, refetch } = useTourById(tourId);
  
  // Ensure that guide info hooks are only called when tour data is available
  const guide1Info = tour?.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour?.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour?.guide3 ? useGuideInfo(tour.guide3) : null;
  
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
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    
    const now = Date.now();
    if (now - lastRefetchTime.current > 30000) { 
      console.log("Tab changed, refreshing data after long timeout");
      handleRefetch();
    }
  }, [handleRefetch]);
  
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

  return {
    tour,
    isLoading,
    error,
    guide1Info,
    guide2Info,
    guide3Info,
    activeTab,
    handleTabChange,
    handleRefetch
  };
}
