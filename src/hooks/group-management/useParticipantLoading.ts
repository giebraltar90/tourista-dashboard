
import { useState, useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchParticipantsForTour } from "@/services/api/tourApi";

/**
 * Hook to handle loading participants for a tour
 */
export const useParticipantLoading = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Load participants data from Supabase
  const loadParticipants = useCallback(async (
    tourId: string,
    onParticipantsLoaded: (groups: VentrataTourGroup[]) => void
  ) => {
    console.log("PARTICIPANTS DEBUG: loadParticipants called for tourId:", tourId);
    setIsLoading(true);
    
    try {
      // Fetch tour groups to get their IDs
      const { data: groups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('id, guide_id, name, entry_time')
        .eq('tour_id', tourId);
        
      if (groupsError) {
        console.error("PARTICIPANTS DEBUG: Error fetching tour groups:", groupsError);
        setIsLoading(false);
        return;
      }
      
      if (!groups || groups.length === 0) {
        console.log("PARTICIPANTS DEBUG: No groups found for tour ID:", tourId);
        setIsLoading(false);
        return;
      }
      
      // Get group IDs
      const groupIds = groups.map(group => group.id);
      console.log("PARTICIPANTS DEBUG: Found group IDs:", groupIds);
      
      // Fetch participants for these groups
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (participantsError) {
        console.error("PARTICIPANTS DEBUG: Error fetching participants:", participantsError);
        setIsLoading(false);
        return;
      }
      
      console.log("PARTICIPANTS DEBUG: Fetched participants from Supabase:", participants);
      
      // Create an array of groups with their participants
      const groupsWithParticipants: VentrataTourGroup[] = groups.map(group => {
        // Get participants for this group
        const groupParticipants = participants
          ? participants
              .filter(p => p.group_id === group.id)
              .map(p => ({
                id: p.id,
                name: p.name,
                count: p.count || 1,
                bookingRef: p.booking_ref,
                childCount: p.child_count || 0,
                group_id: p.group_id
              }))
          : [];
          
        // Calculate size and childCount from participants
        const size = groupParticipants.reduce((total, p) => total + (p.count || 1), 0);
        const childCount = groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0);
        
        console.log(`PARTICIPANTS DEBUG: Group ${group.id} (${group.name || 'Unnamed'}) has ${groupParticipants.length} participants with size=${size}, childCount=${childCount}`);
        
        return {
          id: group.id,
          name: group.name,
          guideId: group.guide_id,
          entryTime: group.entry_time || "9:00", // Default entry time if not provided
          size: size,
          childCount: childCount,
          participants: groupParticipants
        };
      });
      
      console.log("PARTICIPANTS DEBUG: Final groups with participants:", 
        groupsWithParticipants.map(g => ({
          id: g.id,
          name: g.name || 'Unnamed',
          entryTime: g.entryTime,
          size: g.size,
          childCount: g.childCount,
          participantsCount: g.participants?.length || 0,
          participants: g.participants?.map(p => ({
            id: p.id,
            name: p.name,
            count: p.count || 1,
            childCount: p.childCount || 0
          }))
        }))
      );
      
      // Call the callback with the groups data
      onParticipantsLoaded(groupsWithParticipants);
      
      // Invalidate queries to force UI updates
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 500);
    } catch (error) {
      console.error("PARTICIPANTS DEBUG: Error loading participants:", error);
      toast.error("Failed to load participants");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);
  
  return { loadParticipants, isLoading };
};

// Removed createDemoParticipants function completely
