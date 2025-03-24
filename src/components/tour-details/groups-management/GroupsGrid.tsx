
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { GroupGrid } from "./group-assignment/GroupGrid";
import { memo, useCallback, useEffect, useState } from "react";
import { logger } from "@/utils/logger";

interface GroupsGridProps {
  tour: TourCardProps;
  localTourGroups: VentrataTourGroup[];
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null;
  setSelectedParticipant: (data: { participant: VentrataParticipant; fromGroupIndex: number }) => void;
  handleDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, groupIndex: number) => void;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onRefreshParticipants: () => void;
  onOpenAssignGuide: (groupIndex: number) => void;
}

export const GroupsGrid = memo(({
  tour,
  localTourGroups,
  selectedParticipant,
  setSelectedParticipant,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleMoveParticipant,
  isMovePending,
  onRefreshParticipants,
  onOpenAssignGuide
}: GroupsGridProps) => {
  // Use stable groups array to prevent jumping when guide assignments change
  const [stableGroups, setStableGroups] = useState<VentrataTourGroup[]>([]);
  
  // Track group IDs to maintain stable order
  const [groupIdOrder, setGroupIdOrder] = useState<string[]>([]);
  
  // Track when last update happened to prevent too frequent updates
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  
  // Flag to track if we're in the middle of a guide assignment
  const [isGuideChanging, setIsGuideChanging] = useState(false);
  
  useEffect(() => {
    // Initial setup of group order
    if (localTourGroups?.length > 0 && groupIdOrder.length === 0) {
      const initialOrderIds = localTourGroups.map(group => group.id);
      setGroupIdOrder(initialOrderIds);
      setStableGroups(localTourGroups);
      logger.debug("GroupsGrid: Initial group order set", initialOrderIds);
    }
  }, [localTourGroups, groupIdOrder.length]);
  
  // Handle guide assignment changes without disrupting the group order
  useEffect(() => {
    if (localTourGroups?.length > 0 && groupIdOrder.length > 0) {
      const now = Date.now();
      
      // Only update if it's been at least 300ms since our last update
      // This helps prevent multiple rapid updates
      if (now - lastUpdateTime > 300) {
        // First check if there are any new or missing groups
        const currentIds = localTourGroups.map(group => group.id);
        const orderChanged = currentIds.some(id => !groupIdOrder.includes(id)) ||
                            groupIdOrder.some(id => !currentIds.includes(id));
        
        // Only reconstruct the group order if groups were added/removed
        if (orderChanged) {
          setGroupIdOrder(currentIds);
          logger.debug("GroupsGrid: Group order updated due to group structure change", currentIds);
        }
        
        // Create a map for quick lookup
        const groupMap = new Map(localTourGroups.map(group => [group.id, group]));
        
        // Rebuild the stable groups array, preserving order by IDs
        const updatedStableGroups = groupIdOrder
          .filter(id => groupMap.has(id)) // Only keep IDs that exist in current groups
          .map(id => {
            const currentGroup = groupMap.get(id);
            if (!currentGroup) return null;
            
            // Look for the existing stable group to carry over any local state
            const existingStableGroup = stableGroups.find(g => g.id === id);
            
            // Merge the current group with any stable state we want to preserve
            return {
              ...currentGroup,
              // Preserve participants array to avoid flickering
              participants: currentGroup.participants || 
                          (existingStableGroup?.participants || [])
            };
          })
          .filter(Boolean) as VentrataTourGroup[];
        
        // Add any missing groups that weren't in our order
        localTourGroups.forEach(group => {
          if (!groupIdOrder.includes(group.id)) {
            updatedStableGroups.push(group);
          }
        });
          
        setStableGroups(updatedStableGroups);
        setLastUpdateTime(now);
        
        logger.debug("GroupsGrid: Updated stable groups while maintaining order", {
          groupCount: updatedStableGroups.length
        });
      }
    }
  }, [localTourGroups, groupIdOrder, stableGroups, lastUpdateTime]);
  
  // Listen for guide assignment events
  useEffect(() => {
    const handleGuideChange = () => {
      setIsGuideChanging(true);
      // Auto-reset after a delay
      setTimeout(() => setIsGuideChanging(false), 1500);
    };
    
    if (tour?.id) {
      window.addEventListener(`guide-assignment-updated:${tour.id}`, handleGuideChange);
      window.addEventListener(`guide-change:${tour.id}`, handleGuideChange);
      
      return () => {
        window.removeEventListener(`guide-assignment-updated:${tour.id}`, handleGuideChange);
        window.removeEventListener(`guide-change:${tour.id}`, handleGuideChange);
      };
    }
  }, [tour?.id]);
  
  // Force a refresh when necessary
  const handleForceRefresh = useCallback(() => {
    onRefreshParticipants();
    // Reset the guide changing flag
    setIsGuideChanging(false);
  }, [onRefreshParticipants]);
  
  // When guide assignment is changing, use the stable groups to prevent jumping
  const effectiveGroups = isGuideChanging ? stableGroups : localTourGroups.length > 0 ? localTourGroups : stableGroups;
  
  logger.debug("GroupsGrid rendering with groups:", {
    isGuideChanging,
    localGroupsCount: localTourGroups?.length || 0,
    stableGroupsCount: stableGroups.length,
    effectiveGroupsCount: effectiveGroups.length
  });

  return (
    <GroupGrid
      tour={tour}
      localTourGroups={effectiveGroups}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDragLeave={handleDragLeave}
      handleDrop={handleDrop}
      onOpenAssignGuide={onOpenAssignGuide}
      selectedParticipant={selectedParticipant}
      setSelectedParticipant={setSelectedParticipant}
      handleMoveParticipant={handleMoveParticipant}
      isMovePending={isMovePending || isGuideChanging}
      onRefreshParticipants={isGuideChanging ? handleForceRefresh : onRefreshParticipants}
    />
  );
});

GroupsGrid.displayName = "GroupsGrid";
