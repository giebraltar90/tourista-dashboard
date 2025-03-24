
import { useEffect } from 'react';
import { useTourStatistics, refreshTourStatistics } from './useTourStatistics';
import { EventEmitter } from '@/utils/eventEmitter';
import { logger } from '@/utils/logger';
import { useGuideTicketRequirements } from './useGuideTicketRequirements';
import { calculateAndSaveTicketRequirements } from './services/ticket-requirements-service';
import { useTourById } from '../useTourData';
import { useTourGuideInfo } from './useTourGuideInfo';

/**
 * Hook to handle ticket recalculation when participants or guides change
 */
export const useTicketRecalculation = (tourId: string) => {
  // Get tour data and guide info
  const { data: tour } = useTourById(tourId);
  const { guide1Info, guide2Info, guide3Info } = useTourGuideInfo(tour);
  
  // Get participant statistics from materialized view
  const { data: statistics, refetch } = useTourStatistics(tourId);
  
  // Calculate guide ticket requirements
  const { guideTickets } = useGuideTicketRequirements(
    tour, guide1Info, guide2Info, guide3Info
  );
  
  // Save ticket requirements when data changes
  useEffect(() => {
    if (!tourId || !statistics) return;
    
    const saveRequirements = async () => {
      // Save calculated requirements to database
      await calculateAndSaveTicketRequirements(
        tourId,
        statistics.total_adult_count || 0,
        statistics.total_child_count || 0,
        guideTickets.adultTickets,
        guideTickets.childTickets
      );
    };
    
    saveRequirements();
  }, [tourId, statistics, guideTickets.adultTickets, guideTickets.childTickets]);
  
  // Log current statistics for debugging
  useEffect(() => {
    if (statistics) {
      logger.debug("🎟️ [TICKET_CALCULATION] Current tour statistics:", {
        totalParticipants: statistics.total_participants,
        adultCount: statistics.total_adult_count,
        childCount: statistics.total_child_count,
        groupCount: statistics.group_count,
        guideAdultTickets: guideTickets.adultTickets,
        guideChildTickets: guideTickets.childTickets,
        totalTicketsNeeded: (statistics.total_participants || 0) + guideTickets.adultTickets + guideTickets.childTickets
      });
    }
  }, [statistics, guideTickets]);
  
  // Listen for data change events
  useEffect(() => {
    if (!tourId) return;
    
    // Handler for participant and guide changes
    const handleDataChange = async () => {
      logger.debug("🎟️ [TICKET_CALCULATION] Data change detected, refreshing statistics");
      
      // Refresh the materialized view
      await refreshTourStatistics(tourId);
      
      // Refetch the statistics
      refetch();
    };
    
    // Register all relevant event listeners
    const participantMovedListener = EventEmitter.on('participant-moved', handleDataChange);
    const participantChangeListener = EventEmitter.on(`participant-change:${tourId}`, handleDataChange);
    const guideChangeListener = EventEmitter.on(`guide-change:${tourId}`, handleDataChange);
    
    return () => {
      // Properly clean up event listeners using the objects returned by EventEmitter.on
      participantMovedListener.off();
      participantChangeListener.off();
      guideChangeListener.off();
    };
  }, [tourId, refetch]);
  
  return {
    statistics,
    guideTickets
  };
};
