
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for setting up participant refresh event listeners
 */
export const useParticipantRefreshEvents = (
  tourId: string,
  handleRefetch: () => void
) => {
  const queryClient = useQueryClient();

  // Listen for refresh-participants event
  useEffect(() => {
    const handleRefreshParticipants = () => {
      if (tourId) {
        console.log("DATABASE DEBUG: Received refresh-participants event");
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        handleRefetch();
      }
    };
    
    window.addEventListener('refresh-participants', handleRefreshParticipants);
    
    return () => {
      window.removeEventListener('refresh-participants', handleRefreshParticipants);
    };
  }, [tourId, queryClient, handleRefetch]);
};
