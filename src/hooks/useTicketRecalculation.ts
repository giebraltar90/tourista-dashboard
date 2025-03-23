
import { useEffect, useCallback } from 'react';
import { EventEmitter, EVENTS } from '@/utils/eventEmitter';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

/**
 * Hook that listens for events that should trigger ticket recalculation
 */
export const useTicketRecalculation = (tourId: string, onRecalculate: () => void) => {
  const handleRecalculation = useCallback((data: any = {}) => {
    logger.debug(`[TicketRecalculation] Recalculating tickets for tour ${tourId}:`, { 
      source: data.source || 'unknown',
      details: data 
    });
    
    try {
      // Call the recalculation callback
      onRecalculate();
    } catch (error) {
      logger.error('[TicketRecalculation] Error in recalculation:', error);
      toast.error('Error recalculating tickets');
    }
  }, [tourId, onRecalculate]);

  useEffect(() => {
    if (!tourId) return;
    
    // Listen for direct ticket recalculation events
    EventEmitter.on(EVENTS.RECALCULATE_TICKETS(tourId), handleRecalculation);
    
    // Listen for guide changes that require ticket recalculation
    EventEmitter.on(EVENTS.GUIDE_CHANGED(tourId), (data) => {
      logger.debug(`[TicketRecalculation] Guide change detected for ${tourId}:`, data);
      handleRecalculation({ source: 'guide_change', ...data });
    });
    
    // Listen for guide assignment updates
    EventEmitter.on(EVENTS.GUIDE_ASSIGNMENT_UPDATED(tourId), (data) => {
      logger.debug(`[TicketRecalculation] Guide assignment updated for ${tourId}:`, data);
      handleRecalculation({ source: 'guide_assignment_updated', ...data });
    });
    
    // Listen for participant changes that require ticket recalculation
    EventEmitter.on(EVENTS.PARTICIPANT_CHANGED(tourId), (data) => {
      logger.debug(`[TicketRecalculation] Participant change detected for ${tourId}:`, data);
      handleRecalculation({ source: 'participant_change', ...data });
    });

    return () => {
      // Clean up all event listeners
      EventEmitter.off(EVENTS.RECALCULATE_TICKETS(tourId));
      EventEmitter.off(EVENTS.GUIDE_CHANGED(tourId));
      EventEmitter.off(EVENTS.GUIDE_ASSIGNMENT_UPDATED(tourId));
      EventEmitter.off(EVENTS.PARTICIPANT_CHANGED(tourId));
    };
  }, [tourId, handleRecalculation]);

  return {
    // Manually trigger recalculation if needed
    triggerRecalculation: (source: string = 'manual') => {
      handleRecalculation({ source });
    }
  };
};
