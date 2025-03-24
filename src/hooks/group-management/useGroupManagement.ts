
import { useCallback } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { VentrataParticipant } from '@/types/ventrata';
import { logger } from '@/utils/logger';
import { useParticipantService } from './services/participantService';
import { 
  useLocalTourGroups,
  useParticipantSelection,
  useParticipantLoading,
  useParticipantMovement,
  useDragHandlers
} from './hooks';

/**
 * Main hook for group management functionality
 */
export const useGroupManagement = (tour: TourCardProps | null | undefined) => {
  // Use the refactored hooks
  const { localTourGroups, setLocalTourGroups } = useLocalTourGroups(tour);
  const { selectedParticipant, setSelectedParticipant, isMovePending, setIsMovePending } = useParticipantSelection();
  
  // Get participant service functions for additional operations & state
  const { 
    refreshParticipants: refreshParticipantsService,
    isLoading,
    error,
    lastRefreshed
  } = useParticipantService();
  
  // Hook for refreshing participants
  const refreshParticipants = useCallback(async () => {
    try {
      // Skip refreshing if we were just refreshed recently
      const lastRefreshTime = lastRefreshed.getTime();
      const now = Date.now();
      if (now - lastRefreshTime < 5000) {
        logger.debug("🔍 [GROUP_MANAGEMENT] Skipping refresh - last refresh was too recent");
        return;
      }
      
      if (!tour) return;
      
      // When a page loads, sometimes the groups are still loading
      if (!localTourGroups || localTourGroups.length === 0) {
        logger.debug("🔍 [GROUP_MANAGEMENT] No local tour groups yet, using tour.tourGroups as fallback");
        if (tour.tourGroups && tour.tourGroups.length > 0) {
          setLocalTourGroups(tour.tourGroups);
        } else {
          logger.debug("🔍 [GROUP_MANAGEMENT] No tour groups available yet to refresh");
          return;
        }
      }
      
      // Get group IDs from tour groups
      const groupIds = (localTourGroups || []).map(group => group.id).filter(Boolean) as string[];
      
      if (groupIds.length === 0) {
        logger.debug("🔍 [GROUP_MANAGEMENT] No group IDs to refresh");
        return;
      }
      
      logger.debug("🔍 [GROUP_MANAGEMENT] Refreshing participants for groups:", groupIds);
      await refreshParticipantsService();
      await loadParticipantsHandler(groupIds);
      
    } catch (error) {
      logger.error("🔍 [GROUP_MANAGEMENT] Error refreshing participants:", error);
    }
  }, [refreshParticipantsService, tour, localTourGroups, lastRefreshed, setLocalTourGroups]);
  
  // Set up the participant loading hook with the refresh function
  const { loadParticipants } = useParticipantLoading(tour?.id);
  
  // Handler function for loading participants that updates the local state
  const loadParticipantsHandler = useCallback(async (groupIds: string | string[]) => {
    try {
      setIsMovePending(true);
      
      const result = await loadParticipants(groupIds);
      
      if (result.success && result.groups && result.participants) {
        // Update local tour groups with the loaded data
        setLocalTourGroups(prev => {
          // Map participants to their respective groups
          const updatedGroups = [...prev];
          
          for (const group of result.groups) {
            const groupIndex = updatedGroups.findIndex(g => g.id === group.id);
            
            if (groupIndex !== -1) {
              // Find participants for this group
              const groupParticipants = result.participants
                ?.filter(p => p.group_id === group.id)
                .map(p => transformToVentrataParticipant(p));
              
              // Update the group with participants
              updatedGroups[groupIndex] = {
                ...updatedGroups[groupIndex],
                participants: groupParticipants || [],
                size: group.size,
                childCount: group.child_count
              };
            }
          }
          
          return updatedGroups;
        });
        
        logger.debug("🔍 [GROUP_MANAGEMENT] Successfully loaded participants");
      } else if (result.error) {
        logger.error("🔍 [GROUP_MANAGEMENT] Error loading participants:", result.error);
      }
      
      return result;
    } catch (error) {
      logger.error("🔍 [GROUP_MANAGEMENT] Exception loading participants:", error);
      return { success: false, error: 'Exception loading participants' };
    } finally {
      setIsMovePending(false);
    }
  }, [loadParticipants, setLocalTourGroups, setIsMovePending]);
  
  // Set up the participant movement hook
  const { moveParticipant } = useParticipantMovement(tour?.id, refreshParticipants);
  
  // Handler for moving a participant to a new group
  const handleMoveParticipant = useCallback(async (toGroupIndex: number) => {
    if (!selectedParticipant || isMovePending) return;
    
    try {
      setIsMovePending(true);
      
      const { participant, fromGroupIndex } = selectedParticipant;
      
      // Validate both fromGroup and toGroup
      if (fromGroupIndex === toGroupIndex) {
        logger.debug("🔄 [GROUP_MANAGEMENT] Source and target groups are the same, skipping move");
        setIsMovePending(false);
        setSelectedParticipant(null);
        return;
      }
      
      if (!localTourGroups[fromGroupIndex] || !localTourGroups[toGroupIndex]) {
        logger.error("🔄 [GROUP_MANAGEMENT] Invalid source or target group", { fromGroupIndex, toGroupIndex });
        setIsMovePending(false);
        setSelectedParticipant(null);
        return;
      }
      
      const fromGroupId = localTourGroups[fromGroupIndex].id;
      const toGroupId = localTourGroups[toGroupIndex].id;
      
      if (!fromGroupId || !toGroupId) {
        logger.error("🔄 [GROUP_MANAGEMENT] Missing group IDs", { fromGroupId, toGroupId });
        setIsMovePending(false);
        setSelectedParticipant(null);
        return;
      }
      
      await moveParticipant(
        participant, 
        fromGroupId, 
        toGroupId, 
        localTourGroups, 
        setLocalTourGroups,
        fromGroupIndex,
        toGroupIndex
      );
      
    } catch (error) {
      logger.error("🔄 [GROUP_MANAGEMENT] Error moving participant:", error);
    } finally {
      setIsMovePending(false);
      setSelectedParticipant(null);
    }
  }, [
    selectedParticipant, 
    isMovePending, 
    localTourGroups, 
    moveParticipant, 
    setLocalTourGroups,
    setIsMovePending,
    setSelectedParticipant
  ]);
  
  // Get drag and drop handlers
  const dragHandlers = useDragHandlers(isMovePending);
  
  // Custom drop handler that integrates with our state
  const handleDrop = useCallback((e: React.DragEvent, toGroupIndex: number) => {
    e.preventDefault();
    
    try {
      const data = e.dataTransfer.getData('application/json');
      const parsedData = JSON.parse(data);
      
      setSelectedParticipant(parsedData);
      handleMoveParticipant(toGroupIndex);
    } catch (error) {
      logger.error("🔄 [GROUP_MANAGEMENT] Error handling drop:", error);
    }
  }, [handleMoveParticipant, setSelectedParticipant]);
  
  return {
    localTourGroups,
    selectedParticipant,
    setSelectedParticipant,
    handleMoveParticipant,
    isMovePending,
    ...dragHandlers,
    handleDrop,
    loadParticipants: loadParticipantsHandler,
    refreshParticipants,
    isLoading,
    error,
    lastRefreshed
  };
};

// Helper function to transform participant data
const transformToVentrataParticipant = (participant: any): VentrataParticipant => {
  return {
    id: participant.id,
    name: participant.name,
    count: participant.count || 1,
    bookingRef: participant.booking_ref,
    childCount: participant.child_count || 0,
    groupId: participant.group_id,
    group_id: participant.group_id,
    booking_ref: participant.booking_ref
  };
};
