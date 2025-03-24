
import { useCallback, useState } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { VentrataParticipant } from '@/types/ventrata';
import { logger } from '@/utils/logger';
import { useLocalTourGroups, useParticipantSelection, useDragHandlers } from './hooks';
import { supabase } from '@/integrations/supabase/client';

/**
 * Main hook for group management functionality
 */
export const useGroupManagement = (tour: TourCardProps | null | undefined) => {
  // Use the refactored hooks
  const { localTourGroups, setLocalTourGroups } = useLocalTourGroups(tour);
  const { selectedParticipant, setSelectedParticipant, isMovePending, setIsMovePending } = useParticipantSelection();
  
  // Add state for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Hook for refreshing participants
  const refreshParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Skip refreshing if we were just refreshed recently
      const lastRefreshTime = lastRefreshed.getTime();
      const now = Date.now();
      if (now - lastRefreshTime < 5000) {
        logger.debug("🔍 [GROUP_MANAGEMENT] Skipping refresh - last refresh was too recent");
        setIsLoading(false);
        return;
      }
      
      if (!tour) {
        setIsLoading(false);
        return;
      }
      
      // When a page loads, sometimes the groups are still loading
      if (!localTourGroups || localTourGroups.length === 0) {
        logger.debug("🔍 [GROUP_MANAGEMENT] No local tour groups yet, using tour.tourGroups as fallback");
        if (tour.tourGroups && tour.tourGroups.length > 0) {
          setLocalTourGroups(tour.tourGroups);
        } else {
          logger.debug("🔍 [GROUP_MANAGEMENT] No tour groups available yet to refresh");
          setIsLoading(false);
          return;
        }
      }
      
      // Get group IDs from tour groups
      const groupIds = (localTourGroups || []).map(group => group.id).filter(Boolean) as string[];
      
      if (groupIds.length === 0) {
        logger.debug("🔍 [GROUP_MANAGEMENT] No group IDs to refresh");
        setIsLoading(false);
        return;
      }
      
      logger.debug("🔍 [GROUP_MANAGEMENT] Refreshing participants for groups:", groupIds);
      await loadParticipantsHandler(groupIds);
      setLastRefreshed(new Date());
      
    } catch (error) {
      logger.error("🔍 [GROUP_MANAGEMENT] Error refreshing participants:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tour, localTourGroups, lastRefreshed, setLocalTourGroups]);
  
  // Handler function for loading participants that updates the local state
  const loadParticipantsHandler = useCallback(async (groupIds: string | string[]) => {
    try {
      setIsMovePending(true);
      
      // Convert to array if needed
      const groupIdArray = typeof groupIds === 'string' ? [groupIds] : groupIds;
      
      // Fetch participants from the database
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIdArray);
      
      if (participantsError) {
        logger.error("🔍 [GROUP_MANAGEMENT] Error loading participants:", participantsError);
        return { success: false, error: participantsError.message };
      }
      
      // Fetch groups
      const { data: groups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('*')
        .in('id', groupIdArray);
      
      if (groupsError) {
        logger.error("🔍 [GROUP_MANAGEMENT] Error loading groups:", groupsError);
        return { success: false, error: groupsError.message };
      }
      
      // Update local tour groups with the loaded data
      setLocalTourGroups(prev => {
        // Map participants to their respective groups
        const updatedGroups = [...prev];
        
        for (const group of groups) {
          const groupIndex = updatedGroups.findIndex(g => g.id === group.id);
          
          if (groupIndex !== -1) {
            // Find participants for this group
            const groupParticipants = participants
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
      return { success: true, error: null };
      
    } catch (error) {
      logger.error("🔍 [GROUP_MANAGEMENT] Exception loading participants:", error);
      setError(error);
      return { success: false, error: 'Exception loading participants' };
    } finally {
      setIsMovePending(false);
    }
  }, [setLocalTourGroups, setIsMovePending]);
  
  // Move participant function
  const moveParticipant = useCallback(async (
    participant: VentrataParticipant,
    fromGroupId: string,
    toGroupId: string,
    localTourGroups: any[],
    setLocalTourGroups: any,
    fromGroupIndex: number,
    toGroupIndex: number
  ) => {
    try {
      logger.debug("🔄 [GROUP_MANAGEMENT] Moving participant:", {
        participantId: participant.id,
        fromGroupId,
        toGroupId
      });
      
      // Update the participant's group_id in the database
      const { error } = await supabase
        .from('participants')
        .update({ group_id: toGroupId })
        .eq('id', participant.id);
      
      if (error) {
        logger.error("🔄 [GROUP_MANAGEMENT] Error moving participant:", error);
        return false;
      }
      
      // Update local state optimistically
      setLocalTourGroups((prevGroups: any[]) => {
        const newGroups = [...prevGroups];
        
        // Find the participant in the source group
        const sourceGroup = { ...newGroups[fromGroupIndex] };
        const sourceParticipants = Array.isArray(sourceGroup.participants) ? [...sourceGroup.participants] : [];
        const participantIndex = sourceParticipants.findIndex(p => p.id === participant.id);
        
        if (participantIndex === -1) {
          logger.error("🔄 [GROUP_MANAGEMENT] Participant not found in source group:", participant.id);
          return prevGroups;
        }
        
        // Remove participant from source group
        const [movedParticipant] = sourceParticipants.splice(participantIndex, 1);
        
        // Add participant to target group
        const targetGroup = { ...newGroups[toGroupIndex] };
        const targetParticipants = Array.isArray(targetGroup.participants) ? [...targetGroup.participants] : [];
        
        // Update participant's group_id
        const updatedParticipant = {
          ...movedParticipant,
          group_id: toGroupId,
          groupId: toGroupId
        };
        
        targetParticipants.push(updatedParticipant);
        
        // Update groups
        newGroups[fromGroupIndex] = {
          ...sourceGroup,
          participants: sourceParticipants,
          size: sourceGroup.size - (movedParticipant.count || 1),
          childCount: (sourceGroup.childCount || 0) - (movedParticipant.childCount || 0)
        };
        
        newGroups[toGroupIndex] = {
          ...targetGroup,
          participants: targetParticipants,
          size: (targetGroup.size || 0) + (movedParticipant.count || 1),
          childCount: (targetGroup.childCount || 0) + (movedParticipant.childCount || 0)
        };
        
        return newGroups;
      });
      
      logger.debug("🔄 [GROUP_MANAGEMENT] Participant moved successfully:", participant.id);
      return true;
    } catch (error) {
      logger.error("🔄 [GROUP_MANAGEMENT] Exception moving participant:", error);
      return false;
    }
  }, []);
  
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
