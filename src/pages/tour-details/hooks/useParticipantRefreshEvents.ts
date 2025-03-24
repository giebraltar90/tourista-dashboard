
import { useEffect } from 'react';

/**
 * Hook to listen for participant refresh events from other components
 */
export const useParticipantRefreshEvents = (tourId: string, handleRefetch: () => void) => {
  useEffect(() => {
    // This event can be dispatched from other components to trigger a refresh
    const handleRefreshEvent = () => {
      console.log("Received refresh-participants event, refreshing data");
      handleRefetch();
    };

    // Listen for the custom event
    window.addEventListener('refresh-participants', handleRefreshEvent);
    window.addEventListener('participants-loaded', handleRefreshEvent);

    // Clean up
    return () => {
      window.removeEventListener('refresh-participants', handleRefreshEvent);
      window.removeEventListener('participants-loaded', handleRefreshEvent);
    };
  }, [tourId, handleRefetch]);
};
