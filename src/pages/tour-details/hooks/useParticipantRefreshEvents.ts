
import { useEffect } from 'react';
import { logger } from '@/utils/logger';

/**
 * Hook to listen for participant refresh events
 */
export const useParticipantRefreshEvents = (
  tourId: string,
  onRefresh: () => void
) => {
  useEffect(() => {
    if (!tourId) return;
    
    logger.debug(`Setting up participant refresh event listeners for tour ${tourId}`);
    
    // Define event handlers
    const handleRefreshParticipants = () => {
      logger.debug(`Refresh participants event received for tour ${tourId}`);
      onRefresh();
    };
    
    const handleParticipantsLoaded = () => {
      logger.debug(`Participants loaded event received for tour ${tourId}`);
      // Add any specific processing after participants are loaded
    };
    
    // Add event listeners
    window.addEventListener('refresh-participants', handleRefreshParticipants);
    window.addEventListener('participants-loaded', handleParticipantsLoaded);
    
    // Add custom events for this specific tour
    window.addEventListener(`refresh-participants:${tourId}`, handleRefreshParticipants);
    window.addEventListener(`participants-loaded:${tourId}`, handleParticipantsLoaded);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('refresh-participants', handleRefreshParticipants);
      window.removeEventListener('participants-loaded', handleParticipantsLoaded);
      window.removeEventListener(`refresh-participants:${tourId}`, handleRefreshParticipants);
      window.removeEventListener(`participants-loaded:${tourId}`, handleParticipantsLoaded);
    };
  }, [tourId, onRefresh]);
};
