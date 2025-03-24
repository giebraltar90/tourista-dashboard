
import { useEffect, useCallback } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { syncGroupGuideNames } from '@/services/api/tour/groupGuideService';
import { logger } from '@/utils/logger';
import { EventEmitter, EVENTS } from '@/utils/eventEmitter';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to ensure guide assignments are consistent in UI and database
 */
export const useGuideAssignmentConsistency = (
  tourId: string,
  tour?: TourCardProps | null
) => {
  const queryClient = useQueryClient();
  
  // Function to check and fix guide assignments
  const checkAndFixGuideAssignments = useCallback(async () => {
    if (!tourId || !tour) return;
    
    logger.debug(`[GuideConsistency] Checking guide assignments for tour ${tourId}`);
    
    // Sync group names with their assigned guides
    const success = await syncGroupGuideNames(tourId);
    
    if (success) {
      logger.debug(`[GuideConsistency] Successfully synced guide assignments for tour ${tourId}`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      
      // Emit event to notify that guides changed
      EventEmitter.emit(EVENTS.GUIDE_CHANGED(tourId), {
        source: 'guide_consistency_check',
        tourId
      });
    } else {
      logger.error(`[GuideConsistency] Failed to sync guide assignments for tour ${tourId}`);
    }
  }, [tourId, tour, queryClient]);
  
  // Check guide assignments when tour data changes
  useEffect(() => {
    if (tour) {
      checkAndFixGuideAssignments();
    }
  }, [tour, checkAndFixGuideAssignments]);
  
  // Listen for guide assignment events
  useEffect(() => {
    if (!tourId) return;
    
    const handleGuideAssignmentUpdated = () => {
      logger.debug(`[GuideConsistency] Guide assignment updated for tour ${tourId}`);
      checkAndFixGuideAssignments();
    };
    
    // Set up event listeners
    EventEmitter.on(EVENTS.GUIDE_ASSIGNMENT_UPDATED(tourId), handleGuideAssignmentUpdated);
    
    // Clean up event listeners
    return () => {
      EventEmitter.off(EVENTS.GUIDE_ASSIGNMENT_UPDATED(tourId), handleGuideAssignmentUpdated);
    };
  }, [tourId, checkAndFixGuideAssignments]);
  
  return {
    checkAndFixGuideAssignments
  };
};
