
import { useEffect } from 'react';
import { useTourStatistics, refreshTourStatistics } from './useTourStatistics';
import { EventEmitter } from '@/utils/eventEmitter';
import { logger } from '@/utils/logger';

/**
 * Hook to handle ticket recalculation when participants change
 * Now using the materialized view for more efficient data access
 */
export const useTicketRecalculation = (tourId: string) => {
  // Use our improved tour statistics hook
  const { data: statistics, refetch } = useTourStatistics(tourId);
  
  useEffect(() => {
    // Log the current statistics
    if (statistics) {
      logger.debug("🎟️ [TICKET_CALCULATION] Current tour statistics:", {
        totalParticipants: statistics.total_participants,
        adultCount: statistics.total_adult_count,
        childCount: statistics.total_child_count,
        groupCount: statistics.group_count
      });
    }
  }, [statistics]);
  
  useEffect(() => {
    if (!tourId) return;
    
    // Listen for participant movement events
    const handleParticipantChange = async () => {
      logger.debug("🎟️ [TICKET_CALCULATION] Participant change detected, refreshing statistics");
      
      // Refresh the materialized view
      await refreshTourStatistics(tourId);
      
      // Refetch the statistics
      refetch();
    };
    
    // Register event listeners
    const participantMovedListener = EventEmitter.on('participant-moved', handleParticipantChange);
    const participantChangeListener = EventEmitter.on(`participant-change:${tourId}`, handleParticipantChange);
    
    return () => {
      // Clean up event listeners
      participantMovedListener.off();
      participantChangeListener.off();
    };
  }, [tourId, refetch]);
  
  return statistics;
};
