
import { useState, useEffect, useCallback } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { recalculateAllTourGroupSizes } from "./services/participantService";

/**
 * Hook for managing tour group state and calculations
 */
export const useTourGroupState = (tour: TourCardProps) => {
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>(() => {
    console.log("PARTICIPANTS DEBUG: Initial localTourGroups setup from tour.tourGroups:", {
      tourGroupsCount: Array.isArray(tour.tourGroups) ? tour.tourGroups.length : 0,
      hasTourGroups: Array.isArray(tour.tourGroups)
    });
    
    // Create a deep copy of tour groups with participants
    const groups = Array.isArray(tour.tourGroups) ? JSON.parse(JSON.stringify(tour.tourGroups)) : [];
    
    // Ensure each group has a participants array
    return groups.map((group: VentrataTourGroup) => ({
      ...group,
      participants: Array.isArray(group.participants) ? group.participants : []
    }));
  });
  
  // Update local groups when tour groups change
  useEffect(() => {
    if (Array.isArray(tour.tourGroups)) {
      console.log("PARTICIPANTS DEBUG: Tour groups changed, updating localTourGroups:", {
        tourGroupsCount: tour.tourGroups.length,
        firstGroupHasParticipants: tour.tourGroups.length > 0 ? 
          !!tour.tourGroups[0].participants : false
      });
      
      // Create a deep copy to ensure we don't get reference issues
      const updatedGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      
      // Ensure each group has a participants array and correct size calculations
      const normalizedGroups = updatedGroups.map((group: VentrataTourGroup) => {
        // Always ensure participants is an array
        const participants = Array.isArray(group.participants) ? group.participants : [];
        
        // Calculate size and childCount from participants
        let calculatedSize = 0;
        let calculatedChildCount = 0;
        
        for (const participant of participants) {
          calculatedSize += participant.count || 1;
          calculatedChildCount += participant.childCount || 0;
        }
        
        // Return an updated group with the calculated values
        return {
          ...group,
          participants,
          // Override size and childCount with calculated values
          size: calculatedSize,
          childCount: calculatedChildCount
        };
      });
      
      console.log("PARTICIPANTS DEBUG: Updated normalized tour groups:", normalizedGroups.map(g => ({
        id: g.id,
        name: g.name || 'Unnamed',
        calculatedSize: g.size,
        calculatedChildCount: g.childCount,
        participantsCount: g.participants.length
      })));
      
      setLocalTourGroups(normalizedGroups);
    }
  }, [tour.tourGroups]);

  // Recalculate group sizes from participants
  const recalculateGroupSizes = useCallback(() => {
    // Create a deep copy to avoid mutation issues
    const updatedGroups = JSON.parse(JSON.stringify(localTourGroups));
    const recalculatedGroups: VentrataTourGroup[] = [];
    
    // Process each group individually
    for (const group of updatedGroups) {
      // Calculate directly from participants array if it exists
      if (Array.isArray(group.participants) && group.participants.length > 0) {
        let totalSize = 0;
        let totalChildCount = 0;
        
        for (const p of group.participants) {
          totalSize += p.count || 1;
          totalChildCount += p.childCount || 0;
        }
        
        console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" recalculated:`, {
          size: totalSize,
          childCount: totalChildCount,
          participantsCount: group.participants.length
        });
        
        // Add updated group to the new array
        recalculatedGroups.push({
          ...group,
          size: totalSize,
          childCount: totalChildCount
        });
      } else {
        // If no participants, size should be 0
        console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants, setting counts to 0`);
        recalculatedGroups.push({
          ...group,
          size: 0,
          childCount: 0
        });
      }
    }
    
    // Set the state with the new array directly
    setLocalTourGroups(recalculatedGroups);
    return recalculatedGroups;
  }, [localTourGroups]);

  return {
    localTourGroups,
    setLocalTourGroups,
    recalculateGroupSizes
  };
};
