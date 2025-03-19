
import { useTourById } from "../useTourData";
import { updateTourGroups } from "@/services/ventrataApi";
import { useGuideData } from "../useGuideData";
import { toast } from "sonner";
import { useModifications } from "../useModifications";
import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to assign or unassign guides to tour groups
 */
export const useAssignGuide = (tourId: string) => {
  const { data: tour } = useTourById(tourId);
  const { guides } = useGuideData();
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();
  const pendingAssignmentsRef = useRef<Map<number, string | undefined>>(new Map());
  
  /**
   * Find guide name based on guide ID
   */
  const findGuideName = useCallback((guideId?: string) => {
    if (!guideId || guideId === "_none") return "Unassigned";
    if (!tour) return "Unknown";
    
    // Check primary guides first
    if (guideId === "guide1") return tour.guide1;
    if (guideId === "guide2") return tour.guide2 || "Guide 2";
    if (guideId === "guide3") return tour.guide3 || "Guide 3";
    
    // Try to find guide by ID
    const guide = guides.find(g => g.id === guideId);
    if (guide) return guide.name;
    
    // Check if ID contains guide name (fallback)
    if (tour.guide1 && guideId.includes(tour.guide1)) return tour.guide1;
    if (tour.guide2 && guideId.includes(tour.guide2)) return tour.guide2;
    if (tour.guide3 && guideId.includes(tour.guide3)) return tour.guide3;
    
    return guideId;
  }, [tour, guides]);
  
  /**
   * Generate a group name based on guide assignment
   */
  const generateGroupName = useCallback((currentName: string, guideName: string) => {
    const namePattern = /^.+'s Group$/;
    
    // If the group name follows the pattern "X's Group", update it with new guide name
    // or if it's the first assignment or contains "Group", also update the name
    if (namePattern.test(currentName) || currentName.includes("Group")) {
      if (guideName && guideName !== "Unassigned") {
        return `${guideName}'s Group`;
      }
    }
    
    // Keep the existing name if we're removing a guide or couldn't find a pattern match
    return currentName;
  }, []);
  
  /**
   * Assign a guide to a specific group
   */
  const assignGuide = useCallback(async (groupIndex: number, guideId?: string) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      console.log("Assigning guide to group:", { groupIndex, guideId, tourId });
      
      // Store this pending assignment to protect against race conditions
      pendingAssignmentsRef.current.set(groupIndex, guideId);
      
      // If guideId is "_none", treat it as undefined to unassign the guide
      const actualGuideId = guideId === "_none" ? undefined : guideId;
      
      // Create a deep copy of tourGroups to avoid mutation issues
      const updatedTourGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      
      // Get the current group name and guide ID for comparison
      let groupName = updatedTourGroups[groupIndex].name;
      const currentGuideId = updatedTourGroups[groupIndex].guideId;
      
      // Skip processing if nothing changes
      if (currentGuideId === actualGuideId) {
        console.log("No change in guide assignment, skipping update");
        pendingAssignmentsRef.current.delete(groupIndex);
        return true;
      }
      
      // Find guide name for the modification description
      const guideName = findGuideName(actualGuideId);
      
      // Generate a new group name if needed
      const newGroupName = generateGroupName(groupName, guideName);
      
      // Update the group with new guide ID and possibly new name
      updatedTourGroups[groupIndex] = {
        ...updatedTourGroups[groupIndex],
        guideId: actualGuideId,
        name: newGroupName
      };

      console.log("Updated tour groups:", updatedTourGroups);
      
      // CRITICAL FIX: Save the updated tour groups before making the API call
      const updatedTour = {
        ...tour,
        tourGroups: updatedTourGroups
      };
      
      // IMPORTANT: Immediately update local cache BEFORE API call
      // This prevents UI flicker during API request
      queryClient.setQueryData(['tour', tourId], updatedTour);
      
      // Track if any persistence method succeeded
      let updateSuccess = false;
      
      // Try to save to Supabase if it's a UUID tour
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tourId);
      
      if (isUuid) {
        try {
          // For UUID tours, attempt to update the tour_groups table in Supabase
          console.log("Updating tour group in Supabase:", {
            name: newGroupName,
            guide_id: actualGuideId,
            tour_id: tourId
          });
          
          // Get the group ID if it exists, otherwise just update by index
          const groupId = updatedTourGroups[groupIndex].id; 
          
          if (groupId) {
            // Update existing group
            const { error } = await supabase
              .from('tour_groups')
              .update({
                name: newGroupName,
                guide_id: actualGuideId
              })
              .eq('id', groupId);
              
            if (error) {
              console.error("Supabase update failed:", error);
            } else {
              console.log("Successfully updated group in Supabase");
              updateSuccess = true;
            }
          }
        } catch (error) {
          console.error("Supabase error:", error);
        }
      }
      
      // If Supabase failed or it's a mock tour, try the API
      if (!updateSuccess) {
        // Call the API to update tour groups
        console.log("Falling back to API for tour group update");
        const result = await updateTourGroups(tourId, updatedTourGroups);
        if (result) {
          updateSuccess = true;
        }
      }
      
      // Record this modification if any method succeeded
      if (updateSuccess) {
        const modificationDescription = guideName !== "Unassigned"
          ? `Guide ${guideName} assigned to group ${updatedTourGroups[groupIndex].name}`
          : `Guide removed from group ${updatedTourGroups[groupIndex].name}`;
          
        await addModification(modificationDescription, {
          type: "guide_assignment",
          groupIndex,
          guideId: actualGuideId,
          guideName,
          groupName: updatedTourGroups[groupIndex].name
        });
      }
      
      // Ensure the cache remains updated with this guide assignment
      // We're avoiding invalidation and manually updating to prevent UI flicker
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return updatedTour;
        
        // Create a new deep copy to ensure React detects the change
        const newData = JSON.parse(JSON.stringify(oldData));
        
        // Only update this specific group's data
        if (newData.tourGroups[groupIndex]) {
          newData.tourGroups[groupIndex] = {
            ...newData.tourGroups[groupIndex],
            guideId: actualGuideId,
            name: newGroupName
          };
        }
        
        console.log("Re-updated cache data after API success:", newData);
        return newData;
      });
      
      // Clear the pending assignment
      pendingAssignmentsRef.current.delete(groupIndex);
      
      // Schedule a VERY delayed future refresh, but with much lower priority
      // This ensures eventual data consistency without disrupting the UX
      setTimeout(() => {
        // Only refetch if there are no pending assignments to avoid conflicts
        if (pendingAssignmentsRef.current.size === 0) {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        }
      }, 5000); // 5 seconds, extremely long to avoid UI issues
      
      // Notify about successful assignment
      if (updateSuccess) {
        if (guideName !== "Unassigned") {
          toast.success(`Guide ${guideName} assigned to group successfully`);
        } else {
          toast.success("Guide removed from group");
        }
      } else {
        toast.error("Could not persist guide assignment");
      }
      
      return updateSuccess;
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide to group");
      
      // Clear the pending assignment
      pendingAssignmentsRef.current.delete(groupIndex);
      
      // Don't invalidate the query - that could cause more issues
      // Just show the error toast and let the user try again
      throw error;
    }
  }, [tour, tourId, findGuideName, generateGroupName, addModification, queryClient]);
  
  return { assignGuide };
};
