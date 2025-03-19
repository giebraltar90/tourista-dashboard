
import { useState, useEffect, useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useParticipantMovement } from "./useParticipantMovement";
import { useDragAndDrop } from "./useDragAndDrop";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useGroupManagement = (tour: TourCardProps) => {
  const queryClient = useQueryClient();
  
  const [localTourGroups, setLocalTourGroups] = useState<VentrataTourGroup[]>(() => {
    // Create a deep copy of tour groups with participants
    const groups = JSON.parse(JSON.stringify(tour.tourGroups || []));
    
    // Ensure each group has a participants array
    return groups.map((group: VentrataTourGroup) => ({
      ...group,
      participants: Array.isArray(group.participants) ? group.participants : []
    }));
  });
  
  // Update local groups when tour groups change
  useEffect(() => {
    if (tour.tourGroups) {
      const updatedGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      // Ensure each group has a participants array
      const normalizedGroups = updatedGroups.map((group: VentrataTourGroup) => ({
        ...group,
        participants: Array.isArray(group.participants) ? group.participants : []
      }));
      setLocalTourGroups(normalizedGroups);
    }
  }, [tour.tourGroups]);
  
  // Load participants data from Supabase
  const loadParticipants = useCallback(async (tourId: string) => {
    try {
      // Fetch tour groups to get their IDs
      const { data: groups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('id')
        .eq('tour_id', tourId);
        
      if (groupsError) {
        console.error("Error fetching tour groups:", groupsError);
        return;
      }
      
      if (!groups || groups.length === 0) {
        console.log("No groups found for tour ID:", tourId);
        return;
      }
      
      // Get group IDs
      const groupIds = groups.map(group => group.id);
      
      // Fetch participants for these groups
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        return;
      }
      
      // Update local groups with participants
      setLocalTourGroups(prevGroups => {
        const updatedGroups = prevGroups.map(group => {
          const groupParticipants = participants
            ? participants
                .filter(p => p.group_id === group.id)
                .map(p => ({
                  id: p.id,
                  name: p.name,
                  count: p.count || 1,
                  bookingRef: p.booking_ref,
                  childCount: p.child_count || 0,
                  group_id: p.group_id // Keep the group_id for reference
                }))
            : [];
            
          return {
            ...group,
            participants: groupParticipants,
            // Update group size and childCount based on participants
            size: groupParticipants.reduce((total, p) => total + (p.count || 1), 0),
            childCount: groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0)
          };
        });
        
        // Force a refresh of the tour data to reflect these changes
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        }, 500);
        
        return updatedGroups;
      });
    } catch (error) {
      console.error("Error loading participants:", error);
      toast.error("Failed to load participants");
    }
  }, [queryClient]);

  // Get participant movement capabilities from the hook
  const {
    selectedParticipant,
    isMovePending,
    handleMoveParticipant: moveParticipantToGroup,
    handleOpenMoveDialog: setSelectedParticipant,
    handleCloseMoveDialog: clearSelectedParticipant
  } = useParticipantMovement(tour.id, localTourGroups);
  
  // Use the drag and drop functionality
  const { 
    handleDragStart,
    handleDragOver,
    handleDrop: dropParticipant,
    isDragPending
  } = useDragAndDrop(tour.id, (fromGroupIndex, toGroupIndex, participant, currentGroups) => {
    // Exit early if trying to drop in the same group
    if (fromGroupIndex === toGroupIndex) {
      return null;
    }
    
    // Create a deep copy to avoid mutation
    const updatedGroups = JSON.parse(JSON.stringify(currentGroups));
    
    // Remove from source
    if (updatedGroups[fromGroupIndex]?.participants) {
      updatedGroups[fromGroupIndex].participants = 
        updatedGroups[fromGroupIndex].participants.filter((p: any) => p.id !== participant.id);
      
      // Update counts
      const participantCount = participant.count || 1;
      const childCount = participant.childCount || 0;
      
      updatedGroups[fromGroupIndex].size = Math.max(0, (updatedGroups[fromGroupIndex].size || 0) - participantCount);
      updatedGroups[fromGroupIndex].childCount = Math.max(0, (updatedGroups[fromGroupIndex].childCount || 0) - childCount);
    }
    
    // Add to destination
    if (!updatedGroups[toGroupIndex].participants) {
      updatedGroups[toGroupIndex].participants = [];
    }
    
    // Update participant's group_id
    const updatedParticipant = {
      ...participant, 
      group_id: updatedGroups[toGroupIndex].id
    };
    updatedGroups[toGroupIndex].participants.push(updatedParticipant);
    
    // Update counts
    const participantCount = participant.count || 1;
    const childCount = participant.childCount || 0;
    
    updatedGroups[toGroupIndex].size = (updatedGroups[toGroupIndex].size || 0) + participantCount;
    updatedGroups[toGroupIndex].childCount = (updatedGroups[toGroupIndex].childCount || 0) + childCount;
    
    return updatedGroups;
  });
  
  // Wrapper for moving a participant to a specific group
  const handleMoveParticipant = (toGroupIndex: number) => {
    if (toGroupIndex >= 0 && toGroupIndex < localTourGroups.length) {
      moveParticipantToGroup(toGroupIndex);
    } else {
      console.error("Invalid group index for move operation:", toGroupIndex);
      toast.error("Cannot move participant: Invalid group selection");
    }
  };
  
  // Handler for dropping a participant into a group
  const handleDrop = (e: React.DragEvent, toGroupIndex: number) => {
    if (toGroupIndex >= 0 && toGroupIndex < localTourGroups.length) {
      dropParticipant(e, toGroupIndex, localTourGroups, setLocalTourGroups);
    } else {
      console.error("Invalid group index for drop operation:", toGroupIndex);
    }
  };

  return {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setSelectedParticipant,
    isMovePending: isMovePending || isDragPending,
    loadParticipants
  };
};
