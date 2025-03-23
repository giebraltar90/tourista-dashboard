
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EventEmitter } from '@/utils/eventEmitter';

/**
 * Hook to trigger ticket recalculation when participants or guides change
 */
export const useTicketRecalculation = (tourId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Set up listeners for participant and guide changes
    const handleParticipantChange = () => {
      console.log("🎟️ [useTicketRecalculation] Participant change detected, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['participantCounts', tourId] });
    };
    
    const handleGuideChange = () => {
      console.log("🎟️ [useTicketRecalculation] Guide change detected, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['guideInfo', tourId] });
    };
    
    // Register event listeners
    EventEmitter.on(`participant-change:${tourId}`, handleParticipantChange);
    EventEmitter.on(`guide-change:${tourId}`, handleGuideChange);
    
    // Cleanup event listeners on unmount
    return () => {
      EventEmitter.off(`participant-change:${tourId}`, handleParticipantChange);
      EventEmitter.off(`guide-change:${tourId}`, handleGuideChange);
    };
  }, [tourId, queryClient]);
  
  // Expose methods to manually trigger recalculations
  const notifyParticipantChange = () => {
    EventEmitter.emit(`participant-change:${tourId}`);
  };
  
  const notifyGuideChange = () => {
    EventEmitter.emit(`guide-change:${tourId}`);
  };
  
  return {
    notifyParticipantChange,
    notifyGuideChange
  };
};
