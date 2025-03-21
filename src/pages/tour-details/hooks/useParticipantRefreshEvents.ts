
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

  // Listen for refresh-participants event
  useEffect(() => {
    const handleRefreshParticipants = () => {
      if (!tourId || isRefreshingRef.current) return;
      
      const now = Date.now();
      // Prevent refreshes too close together (within 2 seconds)
      if (now - lastRefreshTime.current < 2000) {
        console.log("DATABASE DEBUG: Skipping refresh, too soon after last refresh");
        return;
      }
      
      console.log("DATABASE DEBUG: Received refresh-participants event");
      isRefreshingRef.current = true;
      lastRefreshTime.current = now;
      
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      handleRefetch();
      
      // Reset the refreshing flag after a delay
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 2000);
    };
    
    window.addEventListener('refresh-participants', handleRefreshParticipants);
    
    return () => {
      window.removeEventListener('refresh-participants', handleRefreshParticipants);
    };
  }, [tourId, queryClient, handleRefetch]);
};
