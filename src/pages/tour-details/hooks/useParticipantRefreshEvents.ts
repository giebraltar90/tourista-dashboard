
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for setting up participant refresh event listeners
 */
export const useParticipantRefreshEvents = (
  tourId: string,
  handleRefetch: () => void
) => {
  const queryClient = useQueryClient();
  const isRefreshingRef = useRef(false);
  const lastRefreshTime = useRef(0);
  const refreshEventCount = useRef(0);
  
  // Listen for refresh-participants event
  useEffect(() => {
    const handleRefreshParticipants = () => {
      if (!tourId || isRefreshingRef.current) return;
      
      const now = Date.now();
      // Prevent refreshes too close together (within 3 seconds)
      if (now - lastRefreshTime.current < 3000) {
        console.log("DATABASE DEBUG: Skipping refresh, too soon after last refresh");
        return;
      }
      
      refreshEventCount.current += 1;
      console.log(`DATABASE DEBUG: Received refresh-participants event #${refreshEventCount.current}`);
      
      isRefreshingRef.current = true;
      lastRefreshTime.current = now;
      
      // Only invalidate the cache, don't trigger additional refresh actions
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      
      // Only call handleRefetch once
      handleRefetch();
      
      // Reset the refreshing flag after a delay
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 3000); // Increased to 3 seconds to further prevent rapid refreshes
    };
    
    window.addEventListener('refresh-participants', handleRefreshParticipants);
    
    return () => {
      window.removeEventListener('refresh-participants', handleRefreshParticipants);
    };
  }, [tourId, queryClient, handleRefetch]);
};
