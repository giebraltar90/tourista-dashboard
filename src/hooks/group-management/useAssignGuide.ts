
import { useTourById } from "../tourData/useTourById";
import { useGuideData } from "../useGuideData";
import { useModifications } from "../useModifications";
import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { processGuideAssignment } from "./services/guideAssignmentProcessor";
import { recordGuideAssignmentModification } from "./services/guideAssignmentService";
import { toast } from "sonner";

/**
 * Hook to assign or unassign guides to tour groups with improved debouncing
 * and race condition prevention
 */
export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { guides = [] } = useGuideData() || { guides: [] };
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();
  const pendingAssignmentsRef = useRef<Map<number, { guideId: string | undefined, timestamp: number }>>(new Map());
  
  /**
   * Assign a guide to a specific group with improved race condition prevention
   */
  const assignGuide = useCallback(async (groupIndex: number, guideId?: string) => {
    try {
      if (!tour) {
        console.error("Cannot assign guide: Tour data not available");
        return false;
      }
      
      console.log("Starting guide assignment:", { groupIndex, guideId, tourId });
      
      // Validate groupIndex is within bounds
      if (groupIndex < 0 || groupIndex >= (tour.tourGroups?.length || 0)) {
        console.error(`Invalid group index: ${groupIndex}. Available groups: ${tour.tourGroups?.length}`);
        toast.error("Cannot assign guide: Invalid group");
        return false;
      }
      
      const now = Date.now();
      const pendingAssignment = pendingAssignmentsRef.current.get(groupIndex);
      
      // Special handling for "_none" which means "remove guide"
      const actualGuideId = guideId === "_none" ? undefined : guideId;
      
      // If there's already a pending assignment for this group that's less than 5 seconds old,
      // and it's for the same guide ID, we'll ignore this request to prevent race conditions
      if (pendingAssignment && 
          pendingAssignment.guideId === actualGuideId && 
          now - pendingAssignment.timestamp < 5000) {
        console.log("Ignoring duplicate assignment request:", { groupIndex, guideId });
        return true; // Return success so UI doesn't show error
      }
      
      // Store this pending assignment with a timestamp
      pendingAssignmentsRef.current.set(groupIndex, { 
        guideId: actualGuideId,
        timestamp: now
      });
      
      console.log("Processing guide assignment:", { 
        groupIndex, 
        actualGuideId, 
        pendingAssignments: [...pendingAssignmentsRef.current.entries()],
        tourGroups: tour.tourGroups ? tour.tourGroups.map(g => ({id: g.id, name: g.name, guideId: g.guideId})) : []
      });
      
      // CRITICAL FIX: First cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      // Next, get the latest data before making changes
      const latestTour = queryClient.getQueryData(['tour', tourId]) || tour;
      
      // Verify the group still exists in the latest data
      if (!latestTour.tourGroups || groupIndex >= latestTour.tourGroups.length) {
        console.error("Group no longer exists in latest tour data");
        toast.error("Cannot assign guide: Group not found");
        return false;
      }
      
      // Verify we're updating the correct group by ID, not just by index
      const targetGroupId = tour.tourGroups[groupIndex].id;
      const latestGroupIndex = latestTour.tourGroups.findIndex(g => g.id === targetGroupId);
      
      if (latestGroupIndex === -1) {
        console.error(`Cannot find group with ID ${targetGroupId} in latest tour data`);
        toast.error("Cannot assign guide: Group not found");
        return false;
      }
      
      // If group index has changed, use the latest index
      const finalGroupIndex = latestGroupIndex !== -1 ? latestGroupIndex : groupIndex;
      
      console.log(`Group index verification: original=${groupIndex}, latest=${finalGroupIndex}, id=${targetGroupId}`);
      
      const result = await processGuideAssignment(
        tourId,
        finalGroupIndex,
        latestTour,
        guides,
        actualGuideId,
        queryClient
      );
      
      console.log("Guide assignment result:", result);
      
      if (result.success) {
        // Record the modification
        await recordGuideAssignmentModification(
          tourId,
          finalGroupIndex,
          actualGuideId,
          result.guideName,
          result.groupName,
          addModification
        );
        
        // CRITICAL FIX: Apply optimistic update directly to the cache for all related components
        // This ensures the change is visible immediately AND persists between tab switches
        queryClient.setQueryData(['tour', tourId], (oldData: any) => {
          if (!oldData) return null;
          
          // Create a deep copy to avoid reference issues
          const newData = JSON.parse(JSON.stringify(oldData));
          
          // Find the group by ID to ensure we're updating the correct one
          const groupToUpdate = newData.tourGroups.find((g: any) => g.id === targetGroupId);
          
          if (groupToUpdate) {
            // Apply the guide ID update to the specific group
            groupToUpdate.guideId = actualGuideId;
            // Apply the name update if it changed
            if (result.groupName) {
              groupToUpdate.name = result.groupName;
            }
          }
          
          // IMPORTANT: Also sync the main guide assignments if they were affected
          // This ensures the GuidesAssignedSection shows updated data
          if (finalGroupIndex === 0 && actualGuideId) {
            newData.guide1 = result.guideName;
          } else if (finalGroupIndex === 1 && actualGuideId) {
            newData.guide2 = result.guideName;
          } else if (finalGroupIndex === 2 && actualGuideId) {
            newData.guide3 = result.guideName;
          }
          
          return newData;
        });
        
        // Force a more comprehensive refetch to ensure server data is synced
        setTimeout(() => {
          // Cancel any in-flight queries first to prevent race conditions
          queryClient.cancelQueries();
          
          // Invalidate ALL related queries to ensure complete synchronization
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
          queryClient.invalidateQueries({ queryKey: ['tours'] });
          queryClient.invalidateQueries({ queryKey: ['groups'] });
          queryClient.invalidateQueries({ queryKey: ['guides'] });
          
          // Force a full refetch
          refetch();
        }, 1000);
        
        toast.success(`Guide ${result.guideName || 'Unknown'} assigned successfully`);
      } else {
        toast.error("Failed to assign guide");
      }
      
      // Clear the pending assignment after processing is complete
      // Use a longer debounce time of 5 seconds to prevent rapid changes
      setTimeout(() => {
        // Only clear if it's the same assignment we started with
        const current = pendingAssignmentsRef.current.get(groupIndex);
        if (current && current.timestamp === now) {
          pendingAssignmentsRef.current.delete(groupIndex);
        }
      }, 5000);
      
      return result.success;
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide due to an error");
      
      // Clear the pending assignment
      pendingAssignmentsRef.current.delete(groupIndex);
      
      throw error;
    }
  }, [tour, tourId, guides, addModification, queryClient, refetch]);
  
  return { assignGuide };
};
