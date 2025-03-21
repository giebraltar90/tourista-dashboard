
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
      
      // Fetch ALL participants for the groups in a single query, even if some groups have no participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (participantsError) {
        console.error("PARTICIPANT LOADING: Error fetching participants:", participantsError);
        setIsLoading(false);
        return;
      }
      
      console.log("PARTICIPANT LOADING: Fetched participants from Supabase:", participantsData);
      
      // Check if there might be missing participants for groups with size > 0
      const groupsWithMissingParticipants = groups.filter(group => {
        const groupParticipants = participantsData ? participantsData.filter(p => p.group_id === group.id) : [];
        // Calculate size from participants
        const participantSize = groupParticipants.reduce((total, p) => total + (p.count || 1), 0);
        // If the group has a size but no or too few participants, it's missing data
        return (group.size > 0 && (groupParticipants.length === 0 || participantSize < group.size));
      });
      
      if (groupsWithMissingParticipants.length > 0) {
        console.log("PARTICIPANT LOADING: Groups possibly missing participants:", 
          groupsWithMissingParticipants.map(g => ({
            id: g.id,
            name: g.name,
            size: g.size,
            participantsCount: participantsData ? participantsData.filter(p => p.group_id === g.id).length : 0
          }))
        );
        
        // Use a new modifiedParticipants array to avoid mutating the original
        const modifiedParticipantsData = [...(participantsData || [])];
        
        for (const group of groupsWithMissingParticipants) {
          const existingParticipants = modifiedParticipantsData.filter(p => p.group_id === group.id);
          const existingCount = existingParticipants.reduce((total, p) => total + (p.count || 1), 0);
          
          if (existingCount < group.size) {
            const missingCount = group.size - existingCount;
            // Add a placeholder participant to represent the missing participants
            console.log(`PARTICIPANT LOADING: Adding placeholder for ${missingCount} participants in group ${group.id}`);
            
            const currentDate = new Date().toISOString();
            
            modifiedParticipantsData.push({
              id: `placeholder-${group.id}-${Date.now()}`,
              name: "Group Members",
              count: missingCount,
              booking_ref: "AUTO",
              child_count: group.child_count || 0,
              group_id: group.id,
              created_at: currentDate,
              updated_at: currentDate
            });
          }
        }
        
        // Create an array of groups with their participants
        const groupsWithParticipants: VentrataTourGroup[] = groups.map(group => {
          // Get participants for this group
          const groupParticipants = modifiedParticipantsData
            .filter(p => p.group_id === group.id)
            .map(p => ({
              id: p.id,
              name: p.name,
              count: p.count || 1,
              bookingRef: p.booking_ref,
              childCount: p.child_count || 0,
              group_id: p.group_id,
              created_at: p.created_at,
              updated_at: p.updated_at
            }));
            
          // Calculate size and childCount from participants
          const size = groupParticipants.reduce((total, p) => total + (p.count || 1), 0);
          const childCount = groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0);
          
          console.log(`PARTICIPANT LOADING: Group ${group.id} (${group.name || 'Unnamed'}) processed:`, {
            rawSize: group.size,
            calculatedSize: size,
            rawChildCount: group.child_count,
            calculatedChildCount: childCount,
            participantsCount: groupParticipants.length,
            participantsSample: groupParticipants.slice(0, 2)
          });
          
          // If we still have missing participants but there's a size
          if (groupParticipants.length === 0 && group.size > 0) {
            console.log(`PARTICIPANT LOADING: Adding fallback group member for ${group.id} with size ${group.size}`);
            const currentDate = new Date().toISOString();
            groupParticipants.push({
              id: `fallback-${group.id}-${Date.now()}`,
              name: "Group Members",
              count: group.size,
              bookingRef: "AUTO",
              childCount: group.child_count || 0,
              group_id: group.id,
              created_at: currentDate,
              updated_at: currentDate
            });
          }
          
          return {
            id: group.id,
            name: group.name,
            guideId: group.guide_id,
            entryTime: group.entry_time || "9:00", // Default entry time if not provided
            size: size > 0 ? size : (group.size || 0),
            childCount: childCount > 0 ? childCount : (group.child_count || 0),
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
            participantsCount: g.participants?.length || 0,
            firstParticipants: (g.participants || []).slice(0, 2).map(p => ({
              name: p.name,
              count: p.count,
              childCount: p.childCount
            }))
          }))
        );
        
        // Call the callback with the groups data
        onParticipantsLoaded(groupsWithParticipants);
      } else {
        // No missing participants, process normally
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
                  group_id: p.group_id,
                  created_at: p.created_at,
                  updated_at: p.updated_at
                }))
            : [];
            
          // Calculate size and childCount from participants
          const size = groupParticipants.reduce((total, p) => total + (p.count || 1), 0);
          const childCount = groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0);
          
          // If no participants but there's a size, create a placeholder
          if (groupParticipants.length === 0 && group.size > 0) {
            console.log(`PARTICIPANT LOADING: Adding placeholder for group ${group.id} with size ${group.size}`);
            const currentDate = new Date().toISOString();
            groupParticipants.push({
              id: `placeholder-${group.id}-${Date.now()}`,
              name: "Group Members",
              count: group.size,
              bookingRef: "AUTO",
              childCount: group.child_count || 0,
              group_id: group.id,
              created_at: currentDate,
              updated_at: currentDate
            });
          }
          
          return {
            id: group.id,
            name: group.name,
            guideId: group.guide_id,
            entryTime: group.entry_time || "9:00",
            size: size > 0 ? size : (group.size || 0),
            childCount: childCount > 0 ? childCount : (group.child_count || 0),
            participants: groupParticipants
          };
        });
        
        console.log("PARTICIPANT LOADING: Final processed groups:", 
          groupsWithParticipants.map(g => ({
            id: g.id,
            name: g.name || 'Unnamed',
            size: g.size,
            childCount: g.childCount,
            participantsCount: g.participants?.length || 0
          }))
        );
        
        // Call the callback with the groups data
        onParticipantsLoaded(groupsWithParticipants);
      }
      
      // Invalidate queries to force UI updates
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 500);
    } catch (error) {
      console.error("PARTICIPANT LOADING: Error loading participants:", error);
      toast.error("Failed to load participants");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);
  
  return { loadParticipants, isLoading };
};
