
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EventEmitter } from '@/utils/eventEmitter';
import { logger } from '@/utils/logger';

/**
 * Hook to trigger ticket recalculation when participants or guides change
 */
export const useTicketRecalculation = (tourId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Set up listeners for participant and guide changes
    const handleParticipantChange = () => {
      logger.debug("🎟️ [useTicketRecalculation] Participant change detected, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['participantCounts', tourId] });
      
      // Force refresh to ensure UI updates
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refresh-participant-counts'));
      }, 100);
    };
    
    const handleGuideChange = () => {
      logger.debug("🎟️ [useTicketRecalculation] Guide change detected, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['guideInfo', tourId] });
      
      // Force refresh to ensure UI updates
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refresh-guide-tickets'));
      }, 100);
    };
    
    // Handle database connection errors
    const handleDatabaseError = (error: any) => {
      logger.error("🎟️ [useTicketRecalculation] Database connection error:", error);
      // No need to do anything special here as the error is already handled elsewhere
    };
    
    // Register event listeners
    const unsubscribe1 = EventEmitter.on(`participant-change:${tourId}`, handleParticipantChange);
    const unsubscribe2 = EventEmitter.on(`guide-change:${tourId}`, handleGuideChange);
    const unsubscribe3 = EventEmitter.on('database-connection-error', handleDatabaseError);
    
    // Listen for any tour data changes
    const unsubscribe4 = EventEmitter.on(`tour-data-change:${tourId}`, () => {
      logger.debug("🎟️ [useTicketRecalculation] Tour data change detected, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    });
    
    // Cleanup event listeners on unmount
    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  }, [tourId, queryClient]);
  
  // Expose methods to manually trigger recalculations
  const notifyParticipantChange = useCallback(() => {
    logger.debug(`🎟️ [useTicketRecalculation] Manually notifying participant change for tour ${tourId}`);
    EventEmitter.emit(`participant-change:${tourId}`);
  }, [tourId]);
  
  const notifyGuideChange = useCallback(() => {
    logger.debug(`🎟️ [useTicketRecalculation] Manually notifying guide change for tour ${tourId}`);
    EventEmitter.emit(`guide-change:${tourId}`);
  }, [tourId]);
  
  return {
    notifyParticipantChange,
    notifyGuideChange
  };
};
