
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
    setLocalTourGroups: React.Dispatch<React.SetStateAction<VentrataTourGroup[]>>
  ) => {
    console.log("loadParticipants called for tourId:", tourId);
    setIsLoading(true);
    
    try {
      // Fetch tour groups to get their IDs
      const { data: groups, error: groupsError } = await supabase
        .from('tour_groups')
        .select('id, guide_id, name')
        .eq('tour_id', tourId);
        
      if (groupsError) {
        console.error("Error fetching tour groups:", groupsError);
        setIsLoading(false);
        return;
      }
      
      if (!groups || groups.length === 0) {
        console.log("No groups found for tour ID:", tourId);
        setIsLoading(false);
        
        // Fallback: Let's try getting participants directly from the tour API
        try {
          console.log("Attempting to fetch participants directly via API");
          const participants = await fetchParticipantsForTour(tourId);
          console.log("Direct API fetch returned participants:", participants);
          
          if (participants && participants.length > 0) {
            // If we have participants but no assigned groups, put them all in the first group
            setLocalTourGroups(prevGroups => {
              if (prevGroups.length === 0) return prevGroups;
              
              const updatedGroups = [...prevGroups];
              updatedGroups[0] = {
                ...updatedGroups[0],
                participants: participants.map(p => ({
                  id: p.id,
                  name: p.name,
                  count: p.count || 1,
                  bookingRef: p.bookingRef,
                  childCount: p.childCount || 0,
                  group_id: updatedGroups[0].id
                })),
                size: participants.reduce((sum, p) => sum + (p.count || 1), 0)
              };
              
              return updatedGroups;
            });
          }
        } catch (fallbackError) {
          console.error("Fallback participant fetch failed:", fallbackError);
        }
        
        return;
      }
      
      // Get group IDs
      const groupIds = groups.map(group => group.id);
      console.log("Found group IDs:", groupIds);
      
      // Fetch participants for these groups
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        setIsLoading(false);
        return;
      }
      
      console.log("Fetched participants from Supabase:", participants);
      
      // If no participants found in database, try API as fallback
      if (!participants || participants.length === 0) {
        console.log("No participants found in Supabase, trying API fallback");
        try {
          const apiParticipants = await fetchParticipantsForTour(tourId);
          console.log("Fetched API participants:", apiParticipants);
          
          if (apiParticipants && apiParticipants.length > 0) {
            // Generate mock data for demonstration
            const mockParticipants = apiParticipants.map((p, index) => ({
              id: p.id || `mock-${index}`,
              name: p.name || `Participant ${index+1}`,
              count: p.count || 1,
              bookingRef: p.bookingRef || `BR-${index+100}`,
              childCount: p.childCount || 0,
              group_id: groupIds[0] // Assign all to first group by default
            }));
            
            // Update local groups with mock participants
            setLocalTourGroups(prevGroups => {
              const updatedGroups = prevGroups.map((group, idx) => {
                // Assign participants to groups round-robin
                const groupParticipants = mockParticipants.filter((_, i) => i % prevGroups.length === idx);
                
                return {
                  ...group,
                  participants: groupParticipants,
                  size: groupParticipants.reduce((total, p) => total + (p.count || 1), 0),
                  childCount: groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0)
                };
              });
              
              return updatedGroups;
            });
            
            // Notify user of mock data
            toast.info("Using example participant data for demonstration");
          } else {
            // Create demo participants if none found
            console.log("No participants found in API either, creating demo data");
            createDemoParticipants(tourId, groupIds, groups, setLocalTourGroups);
          }
        } catch (apiError) {
          console.error("API fallback fetch failed:", apiError);
          // Create demo participants as last resort
          createDemoParticipants(tourId, groupIds, groups, setLocalTourGroups);
        }
        setIsLoading(false);
        return;
      }
      
      // CRITICAL FIX: Map groups by their IDs for easier lookups
      const groupsById = groups.reduce((map, group) => {
        map[group.id] = group;
        return map;
      }, {} as Record<string, any>);
      
      // Update local groups with participants
      setLocalTourGroups(prevGroups => {
        console.log("Updating localTourGroups with participants, prevGroups:", prevGroups);
        
        // First, ensure all groups have the same IDs as the ones from the database
        // This is necessary to match participants to groups correctly
        const updatedGroups = prevGroups.map(group => {
          // Find the corresponding group in the database groups
          const matchingDbGroup = groups.find(g => g.id === group.id);
          
          if (!matchingDbGroup) {
            console.warn(`No matching database group found for group ID ${group.id}`);
            return group;
          }
          
          // Get participants for this group
          const groupParticipants = participants
            ? participants
                .filter(p => p.group_id === matchingDbGroup.id)
                .map(p => ({
                  id: p.id,
                  name: p.name,
                  count: p.count || 1,
                  bookingRef: p.booking_ref, // Use snake_case property names from database
                  childCount: p.child_count || 0, // Use snake_case property names from database
                  group_id: p.group_id // Keep the group_id for reference
                }))
            : [];
            
          console.log(`Group ${matchingDbGroup.id} (${matchingDbGroup.name}) has ${groupParticipants.length} participants:`, groupParticipants);
            
          return {
            ...group,
            // CRITICAL: Ensure we preserve guide_id from the database when available
            guideId: matchingDbGroup.guide_id || group.guideId,
            participants: groupParticipants,
            // Update group size and childCount based on participants
            size: groupParticipants.reduce((total, p) => total + (p.count || 1), 0) || group.size || 0,
            childCount: groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0) || group.childCount || 0
          };
        });
        
        console.log("Final updated groups:", updatedGroups);
        
        // Force a refresh of the tour data to reflect these changes
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        }, 500);
        
        return updatedGroups;
      });
    } catch (error) {
      console.error("Error loading participants:", error);
      toast.error("Failed to load participants");
      
      // As last resort, create demo data
      if (tourId) {
        // Get group IDs from Supabase
        try {
          const { data: groups } = await supabase
            .from('tour_groups')
            .select('id, name, guide_id')
            .eq('tour_id', tourId);
            
          if (groups && groups.length > 0) {
            const groupIds = groups.map(g => g.id);
            createDemoParticipants(tourId, groupIds, groups, setLocalTourGroups);
          }
        } catch (e) {
          console.error("Failed to get group IDs:", e);
        }
      }
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
  groupIds: string[], 
  groupsData: any[],
  setGroups: React.Dispatch<React.SetStateAction<VentrataTourGroup[]>>
) => {
  console.log("Creating demo participants for groups:", groupIds);
  
  // Only proceed if we have group IDs
  if (!groupIds.length) {
    console.log("No group IDs to create demo participants for");
    return;
  }
  
  // Map groups by their IDs for easier lookups
  const groupsById = groupsData.reduce((map, group) => {
    map[group.id] = group;
    return map;
  }, {} as Record<string, any>);
  
  // Create demo participants
  const demoParticipants = [
    {
      id: "demo-1",
      name: "John Smith",
      count: 2,
      bookingRef: "BK12345",
      childCount: 1,
      group_id: groupIds[0]
    },
    {
      id: "demo-2",
      name: "Maria Rodriguez",
      count: 3,
      bookingRef: "BK12346",
      childCount: 0,
      group_id: groupIds[0]
    },
    {
      id: "demo-3",
      name: "Alex Johnson",
      count: 1,
      bookingRef: "BK12347",
      childCount: 0,
      group_id: groupIds[0]
    }
  ];
  
  // If we have a second group, assign some participants there
  if (groupIds.length > 1) {
    demoParticipants.push(
      {
        id: "demo-4",
        name: "Emma Wilson",
        count: 4,
        bookingRef: "BK12348",
        childCount: 2,
        group_id: groupIds[1]
      },
      {
        id: "demo-5",
        name: "Liam Brown",
        count: 2,
        bookingRef: "BK12349",
        childCount: 0,
        group_id: groupIds[1]
      }
    );
  }
  
  // Update groups with demo participants
  setGroups(prevGroups => {
    const updatedGroups = prevGroups.map(group => {
      // Find the corresponding group data
      const matchingGroupData = groupsById[group.id];
      
      const groupParticipants = demoParticipants.filter(p => p.group_id === group.id);
      
      return {
        ...group,
        // CRITICAL: Ensure we preserve guide_id from the database when available
        guideId: matchingGroupData?.guide_id || group.guideId,
        participants: groupParticipants,
        size: groupParticipants.reduce((total, p) => total + (p.count || 1), 0) || group.size || 0,
        childCount: groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0) || group.childCount || 0
      };
    });
    
    return updatedGroups;
  });
  
  // Notify user of demo data
  toast.info("Using example participant data for demonstration");
};
