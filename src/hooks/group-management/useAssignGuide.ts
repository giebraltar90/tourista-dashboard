
import { useTourById } from "../useTourData";
import { useGuideData } from "../useGuideData";
import { toast } from "sonner";
import { useModifications } from "../useModifications";
import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isUuid } from "@/types/ventrata";
import { findGuideName } from "./utils/guideNameUtils";
import { prepareGroupUpdate, updateGuideInSupabase, recordGuideAssignmentModification } from "./services/guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";

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
      const currentGuideId = updatedTourGroups[groupIndex].guideId;
      
      // Skip processing if nothing changes
      if (currentGuideId === actualGuideId) {
        console.log("No change in guide assignment, skipping update");
        pendingAssignmentsRef.current.delete(groupIndex);
        return true;
      }
      
      // Find guide name for the modification description
      const guideName = actualGuideId ? findGuideName(actualGuideId, tour, guides) : "Unassigned";
      
      // Update the group with new guide ID and possibly new name
      // Don't update the name if we're unassigning (actualGuideId is undefined)
      const groupsWithUpdates = prepareGroupUpdate(
        updatedTourGroups,
        groupIndex,
        actualGuideId,
        guideName
      );

      console.log("Updated tour groups:", groupsWithUpdates);
      
      // CRITICAL: Immediately update local cache BEFORE API call
      queryClient.setQueryData(['tour', tourId], {
        ...tour,
        tourGroups: groupsWithUpdates
      });
      
      // Check if this is a UUID tour ID for direct database updates
      const tourIsUuid = isUuid(tourId);
      
      // Track if any persistence method succeeded
      let updateSuccess = false;
      
      // First, directly try to update the specific group in Supabase if it's a UUID tour
      if (tourIsUuid) {
        const groupId = updatedTourGroups[groupIndex].id;
        
        if (groupId) {
          const newGroupName = updatedTourGroups[groupIndex].name;
          updateSuccess = await updateGuideInSupabase(tourId, groupId, actualGuideId, newGroupName);
        }
      }
      
      // If direct update failed or it's not a UUID tour, try the updateTourGroups API function
      if (!updateSuccess) {
        console.log("Falling back to updateTourGroups API");
        updateSuccess = await updateTourGroups(tourId, updatedTourGroups);
      }
      
      // Record this modification if any method succeeded
      if (updateSuccess) {
        await recordGuideAssignmentModification(
          tourId,
          groupIndex,
          actualGuideId,
          guideName,
          updatedTourGroups[groupIndex].name,
          addModification
        );
        
        // Show a success message with proper guide name
        if (actualGuideId) {
          toast.success(`Guide ${guideName} assigned to group successfully`);
        } else {
          toast.success("Guide removed from group");
        }
      } else {
        toast.error("Could not persist guide assignment");
      }
      
      // Clear the pending assignment
      pendingAssignmentsRef.current.delete(groupIndex);
      
      // IMPROVEMENT: Force a more immediate background refresh to ensure data consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 1000);
      
      return updateSuccess;
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide to group");
      
      // Clear the pending assignment
      pendingAssignmentsRef.current.delete(groupIndex);
      
      throw error;
    }
  }, [tour, tourId, guides, addModification, queryClient]);
  
  return { assignGuide };
};
