
import { useEffect, useRef } from 'react';

/**
 * Hook to listen for participant refresh events from other components
 * with smart debounce to prevent excessive refreshes
 */
export const useParticipantRefreshEvents = (tourId: string, handleRefetch: () => void) => {
  // Add debounce mechanism to prevent too many refreshes
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const MIN_REFRESH_INTERVAL = 10000; // 10 seconds minimum between refreshes
  
  useEffect(() => {
    const debouncedRefresh = () => {
      const now = Date.now();
      
      // Cancel any pending refresh
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Only refresh if enough time has passed since last refresh
      if (now - lastRefreshTimeRef.current >= MIN_REFRESH_INTERVAL) {
        console.log("Refreshing participant data (enough time has passed)");
        handleRefetch();
        lastRefreshTimeRef.current = now;
      } else {
        // Schedule a refresh for later
        debounceTimerRef.current = setTimeout(() => {
          console.log("Executing delayed participant refresh");
          handleRefetch();
          lastRefreshTimeRef.current = Date.now();
          debounceTimerRef.current = null;
        }, MIN_REFRESH_INTERVAL - (now - lastRefreshTimeRef.current));
      }
    };

    // Handle refresh events but with event data to determine if immediate refresh is needed
    const handleRefreshEvent = (event: Event) => {
      // @ts-ignore - Custom event with detail
      const immediate = event.detail?.immediate || false;
      
      if (immediate) {
        // Force immediate refresh if requested
        console.log("Forced immediate participant refresh requested");
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        handleRefetch();
        lastRefreshTimeRef.current = Date.now();
      } else {
        console.log("Received refresh-participants event, debouncing refresh");
        debouncedRefresh();
      }
    };

    // Listen for the custom events
    window.addEventListener('refresh-participants', handleRefreshEvent);
    window.addEventListener('participants-loaded', handleRefreshEvent);

    // Clean up
    return () => {
      window.removeEventListener('refresh-participants', handleRefreshEvent);
      window.removeEventListener('participants-loaded', handleRefreshEvent);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [tourId, handleRefetch]);
};

// Helper function to dispatch refresh events
export const requestParticipantRefresh = (immediate: boolean = false) => {
  const event = new CustomEvent('refresh-participants', { 
    detail: { immediate }
  });
  window.dispatchEvent(event);
};
