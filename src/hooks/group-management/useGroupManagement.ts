
import { useState, useCallback, useEffect } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { VentrataTourGroup, VentrataParticipant } from '@/types/ventrata';
import { useParticipantService } from './services/participantService';
import { transformToVentrataParticipant } from './services/participantService/transform';
import { logger } from '@/utils/logger';
import { queryCache } from '@/integrations/supabase/client';

/**
 * Main hook for group management functionality
 */
export const useGroupManagement = (tour: TourCardProps | null | undefined) => {
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<{ participant: VentrataParticipant; fromGroupIndex: number } | null>(null);
  const [isMovePending, setIsMovePending] = useState(false);
  
  // Get participant service functions
  const { 
    loadParticipants: loadParticipantsService, 
    moveParticipant: moveParticipantService,
    refreshParticipants: refreshParticipantsService,
    isLoading,
    error,
    lastRefreshed
  } = useParticipantService();
  
  // Effect to initialize localTourGroups when tour changes
  useEffect(() => {
    if (tour?.tourGroups) {
      const cacheKey = `localTourGroups_${tour.id}`;
      const cachedGroups = queryCache.get(cacheKey);
      
      if (cachedGroups) {
        logger.debug("🔍 [GROUP_MANAGEMENT] Using cached tour groups");
        setLocalTourGroups(cachedGroups);
      } else {
        logger.debug("🔍 [GROUP_MANAGEMENT] Setting initial tour groups from tour prop");
        setLocalTourGroups(tour.tourGroups);
        
        // Cache the groups
        queryCache.set(cacheKey, tour.tourGroups);
      }
    }
  }, [tour?.id, tour?.tourGroups]);
  
  // Handle loading participants 
  const loadParticipants = useCallback(async (groupIds: string | string[]) => {
    try {
      setIsMovePending(true);
      
      // Convert single ID to array if needed
      const groupIdArray = typeof groupIds === 'string' ? [groupIds] : groupIds;
      
      logger.debug("🔍 [GROUP_MANAGEMENT] Loading participants for groups:", groupIdArray);
      
      const result = await loadParticipantsService(groupIdArray);
      
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
                .filter(p => p.group_id === group.id)
                .map(transformToVentrataParticipant);
              
              // Update the group with participants
              updatedGroups[groupIndex] = {
                ...updatedGroups[groupIndex],
                participants: groupParticipants,
                size: group.size,
                childCount: group.child_count
              };
            }
          }
          
          // Cache the updated groups
          const cacheKey = tour?.id ? `localTourGroups_${tour.id}` : '';
          if (cacheKey) {
            queryCache.set(cacheKey, updatedGroups);
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
  }, [loadParticipantsService, tour?.id]);
  
  // Handle refreshing participants
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
      
      // Invalidate cache for this tour
      if (tour?.id) {
        const cacheKey = `localTourGroups_${tour.id}`;
        queryCache.invalidate(cacheKey);
      }
      
      logger.debug("🔍 [GROUP_MANAGEMENT] Refreshing participants for groups:", groupIds);
      await refreshParticipantsService();
      await loadParticipants(groupIds);
      
    } catch (error) {
      logger.error("🔍 [GROUP_MANAGEMENT] Error refreshing participants:", error);
    }
  }, [refreshParticipantsService, loadParticipants, tour, localTourGroups, lastRefreshed]);
  
  // Handle moving a participant to a new group
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
      
      logger.debug("🔄 [GROUP_MANAGEMENT] Moving participant", {
        participantId: participant.id,
        fromGroupId,
        toGroupId
      });
      
      // Call the service to move the participant
      const success = await moveParticipantService(participant, fromGroupId, toGroupId);
      
      if (success) {
        logger.debug("🔄 [GROUP_MANAGEMENT] Participant moved successfully");
        
        // Optimistically update the UI, but also trigger a refresh to get accurate sizes
        setLocalTourGroups(prev => {
          const updatedGroups = [...prev];
          
          // Remove from source group
          if (updatedGroups[fromGroupIndex] && updatedGroups[fromGroupIndex].participants) {
            updatedGroups[fromGroupIndex] = {
              ...updatedGroups[fromGroupIndex],
              participants: updatedGroups[fromGroupIndex].participants!.filter(p => p.id !== participant.id)
            };
          }
          
          // Add to target group
          if (updatedGroups[toGroupIndex] && updatedGroups[toGroupIndex].participants) {
            updatedGroups[toGroupIndex] = {
              ...updatedGroups[toGroupIndex],
              participants: [...(updatedGroups[toGroupIndex].participants || []), { ...participant, group_id: toGroupId }]
            };
          }
          
          // Invalidate cache
          if (tour?.id) {
            const cacheKey = `localTourGroups_${tour.id}`;
            queryCache.invalidate(cacheKey);
          }
          
          return updatedGroups;
        });
        
        // Get fresh data after a short delay
        setTimeout(() => {
          refreshParticipants();
        }, 1000);
        
      } else {
        logger.error("🔄 [GROUP_MANAGEMENT] Failed to move participant");
      }
      
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
    moveParticipantService, 
    refreshParticipants,
    tour?.id
  ]);
  
  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => {
    if (isMovePending) return;
    
    e.dataTransfer.setData('application/json', JSON.stringify({
      participant,
      fromGroupIndex
    }));
    
    e.dataTransfer.effectAllowed = 'move';
  }, [isMovePending]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
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
  }, [handleMoveParticipant]);
  
  const handleDragEnd = useCallback(() => {
    // Reset any drag state if needed
  }, []);
  
  return {
    localTourGroups,
    selectedParticipant,
    setSelectedParticipant,
    handleMoveParticipant,
    isMovePending,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    loadParticipants,
    refreshParticipants,
    isLoading,
    error,
    lastRefreshed
  };
};
