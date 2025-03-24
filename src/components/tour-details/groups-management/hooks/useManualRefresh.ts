
import { useState, useCallback, useRef } from "react";

export const useManualRefresh = (refreshFn: () => void, cooldownMs: number = 5000) => {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const lastRefreshTime = useRef<number>(0);

  const handleManualRefresh = useCallback(() => {
    // Check if we're in cooldown period
    const now = Date.now();
    if (now - lastRefreshTime.current < cooldownMs) {
      return;
    }
    
    setIsManualRefreshing(true);
    lastRefreshTime.current = now;
    
    // Invoke the refresh function
    try {
      refreshFn();
      
      // Set a timeout to reset the refreshing state
      setTimeout(() => {
        setIsManualRefreshing(false);
      }, 1000); // Show refreshing state for at least 1 second
    } catch (err) {
      console.error("Error in manual refresh:", err);
      setIsManualRefreshing(false);
    }
  }, [refreshFn, cooldownMs]);

  return {
    isManualRefreshing,
    handleManualRefresh
  };
};
