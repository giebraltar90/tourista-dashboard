
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { EventEmitter, EVENTS } from '@/utils/eventEmitter';
import { logger } from '@/utils/logger';

/**
 * Custom hook to handle ticket recalculation events
 */
export const useTicketRecalculation = (
  tourId: string,
  onRecalculate: () => void
) => {
  // Notify that guides have changed, triggering ticket recalculation
  const notifyGuideChange = useCallback(() => {
    if (!tourId) return;
    
    logger.debug(`🎟️ [useTicketRecalculation] Notifying guide change for tour ${tourId}`);
    EventEmitter.emit(EVENTS.GUIDE_CHANGED(tourId), {
      source: 'ticket_recalculation',
      tourId
    });
    
    // Also call the onRecalculate callback
    onRecalculate();
  }, [tourId, onRecalculate]);
  
  // Notify that participants have changed, triggering ticket recalculation
  const notifyParticipantChange = useCallback(() => {
    if (!tourId) return;
    
    logger.debug(`🎟️ [useTicketRecalculation] Notifying participant change for tour ${tourId}`);
    EventEmitter.emit(EVENTS.PARTICIPANT_MOVED(tourId), {
      source: 'ticket_recalculation',
      tourId
    });
    
    // Also call the onRecalculate callback
    onRecalculate();
  }, [tourId, onRecalculate]);
  
  // Directly request ticket recalculation
  const requestRecalculation = useCallback(() => {
    if (!tourId) return;
    
    logger.debug(`🎟️ [useTicketRecalculation] Requesting ticket recalculation for tour ${tourId}`);
    EventEmitter.emit(EVENTS.RECALCULATE_TICKETS(tourId), {
      source: 'manual_request',
      tourId
    });
    
    // Also call the onRecalculate callback
    onRecalculate();
  }, [tourId, onRecalculate]);
  
  // Listen for ticket update events
  useEffect(() => {
    if (!tourId) return;
    
    const handleTicketsUpdated = (data: any) => {
      logger.debug(`🎟️ [useTicketRecalculation] Tickets updated for tour ${tourId}`, data);
      // We could show a toast here if needed
    };
    
    // Set up event listeners
    EventEmitter.on(EVENTS.TICKETS_UPDATED(tourId), handleTicketsUpdated);
    
    // Clean up event listeners
    return () => {
      EventEmitter.off(EVENTS.TICKETS_UPDATED(tourId), handleTicketsUpdated);
    };
  }, [tourId]);
  
  return {
    notifyGuideChange,
    notifyParticipantChange,
    requestRecalculation
  };
};
