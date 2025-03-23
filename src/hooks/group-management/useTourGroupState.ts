
import { useState, useEffect } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup } from "@/types/ventrata";
import { logger } from "@/utils/logger";

export const useTourGroupState = (tour: TourCardProps) => {
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>([]);
  
  // Effect to initialize local tour groups state from the tour prop
  useEffect(() => {
    // Only update if the tour has groups and the length or IDs are different
    if (tour?.tourGroups) {
      logger.debug(`🔄 [useTourGroupState] Checking if we need to update local tour groups for tour ${tour.id}:`);
      
      // Create a deep copy of tour groups to avoid reference issues
      const copiedGroups = JSON.parse(JSON.stringify(tour.tourGroups || []));
      
      // Check if we have different arrays by comparing IDs
      const localIds = localTourGroups.map(g => g.id);
      const tourIds = copiedGroups.map(g => g.id);
      
      const needsUpdate = 
        localTourGroups.length !== copiedGroups.length || 
        JSON.stringify(localIds) !== JSON.stringify(tourIds);
        
      logger.debug(`🔄 [useTourGroupState] Groups state check:`, {
        localLength: localTourGroups.length, 
        tourLength: copiedGroups.length,
        needsUpdate,
        localIds,
        tourIds
      });
        
      if (needsUpdate) {
        logger.debug(`🔄 [useTourGroupState] Updating local tour groups:`, {
          tourId: tour.id,
          groupCount: copiedGroups.length,
          groupData: copiedGroups.map(g => ({
            id: g.id,
            name: g.name,
            size: g.size,
            guideId: g.guideId
          }))
        });
        
        // Preserve any expanded state from previous groups
        const updatedGroups = copiedGroups.map((group: VentrataTourGroup) => {
          const existingGroup = localTourGroups.find(g => g.id === group.id);
          return {
            ...group,
            // Important: Maintain the original order as in tour.tourGroups
            // Preserve expanded state if it exists in the previous state
            // Type-safe way to handle this property using 'in' operator
            isExpanded: existingGroup && 'isExpanded' in existingGroup
              ? existingGroup.isExpanded 
              : true
          };
        });
        
        setLocalTourGroups(updatedGroups);
      }
    }
  }, [tour.id, tour.tourGroups]);
  
  // Function to recalculate group sizes
  const recalculateGroupSizes = () => {
    setLocalTourGroups(prevGroups => {
      return prevGroups.map(group => {
        // Calculate size and childCount from participants
        const participants = group.participants || [];
        let size = 0;
        let childCount = 0;
        
        participants.forEach(p => {
          const count = p.count || 1;
          const pChildCount = p.childCount || 0;
          size += count;
          childCount += pChildCount;
        });
        
        // Update group with calculated totals
        return {
          ...group,
          size,
          childCount
        };
      });
    });
  };
  
  return {
    localTourGroups,
    setLocalTourGroups,
    recalculateGroupSizes
  };
};
