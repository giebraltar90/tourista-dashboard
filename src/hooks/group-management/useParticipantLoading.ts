
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
    console.log("DATABASE DEBUG: loadParticipants called for tourId:", tourId);
    setIsLoading(true);
    
    try {
      // First, check if the tour exists
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('id')
        .eq('id', tourId)
        .single();
        
      if (tourError) {
        console.error("DATABASE DEBUG: Error fetching tour data:", tourError);
        console.log("DATABASE DEBUG: This could indicate the tour doesn't exist or there's a DB issue");
        setIsLoading(false);
        return;
      }
      
      console.log("DATABASE DEBUG: Found tour with ID:", tourData.id);
      
      // Fetch tour groups to get their IDs
      const { data: groups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('id, guide_id, name, entry_time, size, child_count')
        .eq('tour_id', tourId);
        
      if (groupsError) {
        console.error("DATABASE DEBUG: Error fetching tour groups:", groupsError);
        setIsLoading(false);
        return;
      }
      
      console.log(`DATABASE DEBUG: Found ${groups ? groups.length : 0} groups for tour ID: ${tourId}`);
      
      if (!groups || groups.length === 0) {
        console.log("DATABASE DEBUG: No groups found for tour ID:", tourId);
        setIsLoading(false);
        return;
      }
      
      // Log each group for debugging
      groups.forEach((group, index) => {
        console.log(`DATABASE DEBUG: Group ${index + 1}:`, {
          id: group.id,
          name: group.name,
          entry_time: group.entry_time,
          size: group.size,
          child_count: group.child_count,
          guide_id: group.guide_id,
        });
      });
      
      // Get group IDs
      const groupIds = groups.map(group => group.id);
      console.log("DATABASE DEBUG: Group IDs for participant lookup:", groupIds);
      
      // Fetch ALL participants for the groups in a single query
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (participantsError) {
        console.error("DATABASE DEBUG: Error fetching participants:", participantsError);
        console.log("DATABASE DEBUG: SQL error details:", participantsError.details, participantsError.message);
        setIsLoading(false);
        return;
      }
      
      console.log(`DATABASE DEBUG: Found ${participantsData ? participantsData.length : 0} total participants`);
      
      // If no participants were found, let's check if the participants table exists
      if (!participantsData || participantsData.length === 0) {
        console.log("DATABASE DEBUG: No participants found. Checking if the participants table exists...");
        
        try {
          const { error: tableCheckError } = await supabase
            .from('participants')
            .select('count(*)')
            .limit(1);
            
          if (tableCheckError) {
            console.error("DATABASE DEBUG: Error checking participants table:", tableCheckError);
            console.log("DATABASE DEBUG: This might indicate the participants table doesn't exist");
          } else {
            console.log("DATABASE DEBUG: Participants table exists but no data found for these groups");
            
            // Let's check if there are any participants at all
            const { count, error: countError } = await supabase
              .from('participants')
              .select('*', { count: 'exact', head: true });
              
            if (countError) {
              console.error("DATABASE DEBUG: Error counting participants:", countError);
            } else {
              console.log(`DATABASE DEBUG: Total participants in database: ${count}`);
            }
          }
        } catch (e) {
          console.error("DATABASE DEBUG: Exception when checking participants table:", e);
        }
      }
      
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
          
        console.log(`DATABASE DEBUG: Group ${group.id} (${group.name || 'Unnamed'}) has ${groupParticipants.length} participants`);
        
        if (groupParticipants.length > 0) {
          console.log(`DATABASE DEBUG: First participant in group ${group.name || 'Unnamed'}:`, 
            JSON.stringify(groupParticipants[0], null, 2));
        }
          
        // Calculate size and childCount from participants
        const size = groupParticipants.reduce((total, p) => total + (p.count || 1), 0);
        const childCount = groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0);
        
        console.log(`DATABASE DEBUG: Group ${group.id} (${group.name || 'Unnamed'}) processed:`, {
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
      
      console.log("DATABASE DEBUG: Final groups with participants:", 
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
      console.error("DATABASE DEBUG: Exception in loadParticipants:", error);
      toast.error("Failed to load participants");
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);
  
  return { loadParticipants, isLoading };
};
