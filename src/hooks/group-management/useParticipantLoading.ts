
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
        
        // Create demo participants if we can't get real ones
        createDemoParticipants(tourId, onParticipantsLoaded);
        return;
      }
      
      if (!groups || groups.length === 0) {
        console.log("PARTICIPANTS DEBUG: No groups found for tour ID:", tourId);
        setIsLoading(false);
        
        // Fallback: Let's try getting participants directly from the tour API
        try {
          console.log("PARTICIPANTS DEBUG: Attempting to fetch participants directly via API");
          const participants = await fetchParticipantsForTour(tourId);
          console.log("PARTICIPANTS DEBUG: Direct API fetch returned participants:", participants);
          
          if (participants && participants.length > 0) {
            // Create a dummy group if we need to
            const dummyGroup: VentrataTourGroup = {
              id: "default-group",
              name: "Default Group",
              entryTime: "9:00", // Default entry time
              size: participants.reduce((sum, p) => sum + (p.count || 1), 0),
              childCount: participants.reduce((sum, p) => sum + (p.childCount || 0), 0),
              participants: participants.map(p => ({
                id: p.id,
                name: p.name,
                count: p.count || 1,
                bookingRef: p.bookingRef,
                childCount: p.childCount || 0,
                group_id: "default-group"
              }))
            };
            
            console.log("PARTICIPANTS DEBUG: Created dummy group with", participants.length, "participants");
            onParticipantsLoaded([dummyGroup]);
          } else {
            // No participants at all, use demo data
            console.log("PARTICIPANTS DEBUG: No participants found, creating demo data");
            createDemoParticipants(tourId, onParticipantsLoaded);
          }
        } catch (fallbackError) {
          console.error("PARTICIPANTS DEBUG: Fallback participant fetch failed:", fallbackError);
          // Create demo participants as final fallback
          createDemoParticipants(tourId, onParticipantsLoaded);
        }
        
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
        // Create demo participants if we can't get real ones
        createDemoParticipants(tourId, onParticipantsLoaded);
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
      
      // Check if any participants were found
      const totalParticipants = groupsWithParticipants.reduce((sum, g) => 
        sum + (Array.isArray(g.participants) ? g.participants.length : 0), 0);
      
      console.log("PARTICIPANTS DEBUG: Total participants found:", totalParticipants);
      
      if (totalParticipants === 0) {
        console.log("PARTICIPANTS DEBUG: No participants found in database, creating demo data");
        // Still no participants, create demo data
        createDemoParticipants(tourId, onParticipantsLoaded);
        return;
      }
      
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
      
      // Create demo participants as fallback
      createDemoParticipants(tourId, onParticipantsLoaded);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);
  
  return { loadParticipants, isLoading };
};

/**
 * Helper function to create demo participants for testing
 */
export const createDemoParticipants = (
  tourId: string, 
  onParticipantsLoaded: (groups: VentrataTourGroup[]) => void
) => {
  console.log("PARTICIPANTS DEBUG: Creating demo participants for tour:", tourId);
  
  // Create two demo groups with participants
  const demoGroups: VentrataTourGroup[] = [
    {
      id: "demo-group-1",
      name: "Group 1",
      entryTime: "9:00", // Add default entry time
      size: 6,
      childCount: 2,
      participants: [
        {
          id: "demo-1",
          name: "Smith Family",
          count: 2,
          bookingRef: "BK12345",
          childCount: 1,
          group_id: "demo-group-1"
        },
        {
          id: "demo-2",
          name: "John Davis",
          count: 1,
          bookingRef: "BK12346",
          childCount: 0,
          group_id: "demo-group-1"
        },
        {
          id: "demo-3",
          name: "Rodriguez Family",
          count: 3,
          bookingRef: "BK12347",
          childCount: 1,
          group_id: "demo-group-1"
        }
      ]
    },
    {
      id: "demo-group-2",
      name: "Group 2",
      entryTime: "10:00", // Add different entry time for second group
      size: 6,
      childCount: 2,
      participants: [
        {
          id: "demo-4",
          name: "Wilson Family",
          count: 4,
          bookingRef: "BK12348",
          childCount: 2,
          group_id: "demo-group-2"
        },
        {
          id: "demo-5",
          name: "Lee Brown",
          count: 2,
          bookingRef: "BK12349",
          childCount: 0,
          group_id: "demo-group-2"
        }
      ]
    }
  ];
  
  // Log the demo data we're creating
  console.log("PARTICIPANTS DEBUG: Created demo groups with participants:", 
    demoGroups.map(g => ({
      id: g.id,
      name: g.name,
      size: g.size,
      childCount: g.childCount,
      participants: g.participants.map(p => ({
        name: p.name,
        count: p.count,
        childCount: p.childCount
      }))
    }))
  );
  
  // Call the callback with demo data
  onParticipantsLoaded(demoGroups);
  
  // Notify user of demo data
  toast.info("Using example participant data for demonstration");
};
