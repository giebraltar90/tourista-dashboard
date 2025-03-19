
import { useState, useEffect, useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useParticipantMovement } from "./useParticipantMovement";
import { useDragAndDrop } from "./useDragAndDrop";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGroupManagement = (tour: TourCardProps) => {
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
      
      if (!participants || participants.length === 0) {
        console.log("No participants found for these groups");
        return;
      }
      
      console.log("Found participants:", participants);
      
      // Update local groups with participants
      const updatedGroups = localTourGroups.map(group => {
        const groupParticipants = participants
          .filter(p => p.group_id === group.id)
          .map(p => ({
            id: p.id,
            name: p.name,
            count: p.count,
            bookingRef: p.booking_ref,
            childCount: p.child_count || 0
          }));
          
        return {
          ...group,
          participants: groupParticipants
        };
      });
      
      setLocalTourGroups(updatedGroups);
    } catch (error) {
      console.error("Error loading participants:", error);
      toast.error("Failed to load participants");
    }
  }, [localTourGroups]);

  const {
    selectedParticipant,
    setSelectedParticipant,
    handleMoveParticipant: moveParticipant,
    moveParticipant: moveParticipantLogic,
    isMovePending
  } = useParticipantMovement(tour.id, localTourGroups);
  
  const { 
    handleDragStart,
    handleDragOver,
    handleDrop: dropParticipant,
    isDragPending
  } = useDragAndDrop(tour.id, moveParticipantLogic);
  
  // Wrapper functions to pass the current state
  const handleMoveParticipant = (toGroupIndex: number) => {
    moveParticipant(toGroupIndex, localTourGroups, setLocalTourGroups);
  };
  
  const handleDrop = (e: React.DragEvent, toGroupIndex: number) => {
    dropParticipant(e, toGroupIndex, localTourGroups, setLocalTourGroups);
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
