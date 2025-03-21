
import { useState, useCallback } from "react";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
    console.log("PARTICIPANT LOADING: loadParticipants called for tourId:", tourId);
    setIsLoading(true);
    
    try {
      // Fetch tour groups to get their IDs
      const { data: groups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('id, guide_id, name, entry_time, size, child_count')
        .eq('tour_id', tourId);
        
      if (groupsError) {
        console.error("PARTICIPANT LOADING: Error fetching tour groups:", groupsError);
        setIsLoading(false);
        return;
      }
      
      if (!groups || groups.length === 0) {
        console.log("PARTICIPANT LOADING: No groups found for tour ID:", tourId);
        setIsLoading(false);
        return;
      }
      
      // Get group IDs
      const groupIds = groups.map(group => group.id);
      console.log("PARTICIPANT LOADING: Found group IDs:", groupIds);
      
      // Fetch ALL participants for the groups in a single query
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (participantsError) {
        console.error("PARTICIPANT LOADING: Error fetching participants:", participantsError);
        setIsLoading(false);
        return;
      }
      
      console.log("PARTICIPANT LOADING: Fetched participants from Supabase:", 
        participantsData ? participantsData.length : 0);
      
      // Create an array of groups with their participants
      const groupsWithParticipants: VentrataTourGroup[] = groups.map(group => {
        // Get participants for this group
        const groupParticipants = participantsData
          ? participantsData
              .filter(p => p.group_id === group.id)
              .map(p => ({
                id: p.id,
                name: p.name,
                count: p.count || 1,
                bookingRef: p.booking_ref,
                childCount: p.child_count || 0,
                groupId: group.id,
                group_id: p.group_id,
                booking_ref: p.booking_ref,
                child_count: p.child_count || 0,
                created_at: p.created_at,
                updated_at: p.updated_at
              }))
          : [];
          
        // Calculate size and childCount from participants
        const size = groupParticipants.reduce((total, p) => total + (p.count || 1), 0);
        const childCount = groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0);
        
        console.log(`PARTICIPANT LOADING: Group ${group.id} (${group.name || 'Unnamed'}) processed:`, {
          participants: groupParticipants.length,
          calculatedSize: size,
          databaseSize: group.size
        });
        
        // If group has a size but no participants, we'll use the database size
        const finalSize = groupParticipants.length > 0 ? size : (group.size || 0);
        const finalChildCount = groupParticipants.length > 0 ? childCount : (group.child_count || 0);
        
        return {
          id: group.id,
          name: group.name,
          guideId: group.guide_id,
          entryTime: group.entry_time || "9:00", // Default entry time if not provided
          size: finalSize,
          childCount: finalChildCount,
          participants: groupParticipants
        };
      });
      
      console.log("PARTICIPANT LOADING: Final groups with participants:", 
        groupsWithParticipants.map(g => ({
          id: g.id,
          name: g.name || 'Unnamed',
          entryTime: g.entryTime,
          size: g.size,
          childCount: g.childCount,
          participantsCount: g.participants?.length || 0
        }))
      );
      
      // Call the callback with the groups data
      onParticipantsLoaded(groupsWithParticipants);
      
      // Invalidate queries to force UI updates
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 500);
    } catch (error) {
      console.error("PARTICIPANT LOADING: Error loading participants:", error);
      toast.error("Failed to load participants");
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);
  
  return { loadParticipants, isLoading };
};
