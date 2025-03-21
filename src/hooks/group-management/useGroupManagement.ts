
import { useState, useEffect, useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useParticipantMovement } from "./useParticipantMovement";
import { useDragAndDrop } from "./useDragAndDrop";
import { useParticipantLoading } from "./useParticipantLoading";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recalculateAllTourGroupSizes } from "./services/participantService";

export const useGroupManagement = (tour: TourCardProps) => {
  const queryClient = useQueryClient();
  console.log("PARTICIPANTS DEBUG: useGroupManagement initialized with tour:", tour.id);
  
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
          // CRITICAL FIX: Override size and childCount with calculated values
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
  
  // Get participant loading capabilities
  const { loadParticipants: loadParticipantsInner, isLoading: isLoadingParticipants } = useParticipantLoading();
  
  // Wrapper for loadParticipants to include setLocalTourGroups
  const loadParticipants = useCallback((tourId: string) => {
    console.log(`PARTICIPANTS DEBUG: Loading participants for tour ${tourId}`);
    return loadParticipantsInner(tourId, (groups: VentrataTourGroup[]) => {
      console.log(`PARTICIPANTS DEBUG: Participants loaded, processing ${groups.length} groups`);
      
      // Ensure correct size calculations before setting state
      const recalculatedGroups = recalculateAllTourGroupSizes(groups);
      
      console.log("PARTICIPANTS DEBUG: Groups after recalculation:", recalculatedGroups.map(g => ({
        id: g.id,
        name: g.name || 'Unnamed',
        calculatedSize: g.size,
        calculatedChildCount: g.childCount,
        participantsCount: Array.isArray(g.participants) ? g.participants.length : 0
      })));
      
      setLocalTourGroups(recalculatedGroups);
    });
  }, [loadParticipantsInner]);

  // Get participant movement capabilities from the hook
  const {
    selectedParticipant,
    isMovePending,
    handleMoveParticipant: moveParticipantToGroup,
    handleOpenMoveDialog: setSelectedParticipant,
    handleCloseMoveDialog: clearSelectedParticipant
  } = useParticipantMovement(tour.id, localTourGroups);
  
  // Use the drag and drop functionality with a participant updater function
  const { 
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop: dropParticipant,
    isDragPending,
    draggedParticipant
  } = useDragAndDrop(tour.id, (fromGroupIndex, toGroupIndex, participant, currentGroups) => {
    // Exit early if trying to drop in the same group
    if (fromGroupIndex === toGroupIndex) {
      return null;
    }
    
    console.log(`PARTICIPANTS DEBUG: Moving participant from group ${fromGroupIndex} to group ${toGroupIndex}:`, {
      participant: {
        id: participant.id,
        name: participant.name,
        count: participant.count || 1,
        childCount: participant.childCount || 0
      }
    });
    
    // Create a deep copy to avoid mutation
    const updatedGroups = JSON.parse(JSON.stringify(currentGroups));
    
    // Remove from source
    if (updatedGroups[fromGroupIndex]?.participants) {
      updatedGroups[fromGroupIndex].participants = 
        updatedGroups[fromGroupIndex].participants.filter((p: any) => p.id !== participant.id);
      
      // Update counts
      const participantCount = participant.count || 1;
      const childCount = participant.childCount || 0;
      
      // CRITICAL FIX: Recalculate size from scratch based on remaining participants
      let newSize = 0;
      let newChildCount = 0;
      
      for (const p of updatedGroups[fromGroupIndex].participants) {
        newSize += p.count || 1;
        newChildCount += p.childCount || 0;
      }
      
      updatedGroups[fromGroupIndex].size = newSize;
      updatedGroups[fromGroupIndex].childCount = newChildCount;
      
      console.log(`PARTICIPANTS DEBUG: After removal from group ${fromGroupIndex}:`, {
        remainingParticipants: updatedGroups[fromGroupIndex].participants.length,
        newSize,
        newChildCount
      });
    }
    
    // Add to destination
    if (!Array.isArray(updatedGroups[toGroupIndex].participants)) {
      updatedGroups[toGroupIndex].participants = [];
    }
    
    // Update participant's group_id
    const updatedParticipant = {
      ...participant, 
      groupId: updatedGroups[toGroupIndex].id,
      group_id: updatedGroups[toGroupIndex].id
    };
    updatedGroups[toGroupIndex].participants.push(updatedParticipant);
    
    // CRITICAL FIX: Recalculate size from scratch
    let newToSize = 0;
    let newToChildCount = 0;
    
    for (const p of updatedGroups[toGroupIndex].participants) {
      newToSize += p.count || 1;
      newToChildCount += p.childCount || 0;
    }
    
    updatedGroups[toGroupIndex].size = newToSize;
    updatedGroups[toGroupIndex].childCount = newToChildCount;
    
    console.log(`PARTICIPANTS DEBUG: After addition to group ${toGroupIndex}:`, {
      totalParticipants: updatedGroups[toGroupIndex].participants.length,
      newSize: newToSize,
      newChildCount: newToChildCount
    });
    
    return updatedGroups;
  });
  
  // Wrapper for moving a participant to a specific group
  const handleMoveParticipant = (toGroupIndex: number) => {
    if (toGroupIndex >= 0 && toGroupIndex < localTourGroups.length) {
      console.log(`PARTICIPANTS DEBUG: Moving participant to group ${toGroupIndex}`);
      moveParticipantToGroup(toGroupIndex);
    } else {
      console.error("PARTICIPANTS DEBUG: Invalid group index for move operation:", toGroupIndex);
      toast.error("Cannot move participant: Invalid group selection");
    }
  };
  
  // Handler for dropping a participant into a group
  const handleDrop = (e: React.DragEvent, toGroupIndex: number) => {
    if (toGroupIndex >= 0 && toGroupIndex < localTourGroups.length) {
      console.log(`PARTICIPANTS DEBUG: Dropping participant into group ${toGroupIndex}`);
      dropParticipant(e, toGroupIndex, localTourGroups, (updatedGroups) => {
        console.log(`PARTICIPANTS DEBUG: After drop into group ${toGroupIndex}, updating groups:`, 
          updatedGroups.map(g => ({
            id: g.id,
            name: g.name || 'Unnamed',
            size: g.size,
            childCount: g.childCount,
            participantsCount: g.participants.length
          }))
        );
        setLocalTourGroups(updatedGroups);
      });
    } else {
      console.error("PARTICIPANTS DEBUG: Invalid group index for drop operation:", toGroupIndex);
    }
  };

  // Add a refresh function to manually trigger participant loading
  const refreshParticipants = useCallback(() => {
    if (tour.id) {
      console.log(`PARTICIPANTS DEBUG: Manually refreshing participants for tour ${tour.id}`);
      toast.info("Refreshing participants...");
      loadParticipants(tour.id);
      
      // Force recalculation of all group sizes
      setTimeout(() => {
        const updatedGroups = JSON.parse(JSON.stringify(localTourGroups));
        
        // Recalculate all group sizes from participants
        const recalculatedGroups = updatedGroups.map((group: VentrataTourGroup) => {
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
            
            // Return updated group with recalculated values
            return {
              ...group,
              size: totalSize,
              childCount: totalChildCount
            };
          } else {
            // If no participants, size should be 0
            console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants, setting counts to 0`);
            return {
              ...group,
              size: 0,
              childCount: 0
            };
          }
        });
        
        setLocalTourGroups(recalculatedGroups);
      }, 500);
    }
  }, [tour.id, loadParticipants, localTourGroups]);

  return {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setSelectedParticipant,
    isMovePending: isMovePending || isDragPending || isLoadingParticipants,
    loadParticipants,
    refreshParticipants,
    draggedParticipant
  };
};
