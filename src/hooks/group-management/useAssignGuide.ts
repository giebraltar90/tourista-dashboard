
import { useTourById } from "../tourData/useTourById";
import { useGuideData } from "../useGuideData";
import { useModifications } from "../useModifications";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";

/**
 * Hook to assign or unassign guides to tour groups
 */
export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { guides = [] } = useGuideData() || { guides: [] };
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();
  
  /**
   * Assign a guide to a specific group
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
      
      // Special handling for "_none" which means "remove guide"
      const actualGuideId = guideId === "_none" ? undefined : guideId;
      
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      // Get the latest data before making changes
      const latestTour = queryClient.getQueryData(['tour', tourId]) as TourCardProps | undefined || tour;
      
      // Get the target group
      const targetGroup = latestTour.tourGroups[groupIndex];
      if (!targetGroup) {
        toast.error("Group not found");
        return false;
      }
      
      // Find guide name for display
      let guideName = "Unassigned";
      if (actualGuideId) {
        if (actualGuideId === "guide1" && latestTour.guide1) {
          guideName = latestTour.guide1;
        } else if (actualGuideId === "guide2" && latestTour.guide2) {
          guideName = latestTour.guide2;
        } else if (actualGuideId === "guide3" && latestTour.guide3) {
          guideName = latestTour.guide3;
        } else {
          const guide = guides.find(g => g.id === actualGuideId);
          if (guide) {
            guideName = guide.name;
          }
        }
      }
      
      // Apply optimistic update to the cache
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        
        // Create a deep copy to avoid reference issues
        const newData = JSON.parse(JSON.stringify(oldData));
        
        // Update the specific group
        if (newData.tourGroups[groupIndex]) {
          newData.tourGroups[groupIndex].guideId = actualGuideId;
        }
        
        return newData;
      });
      
      // Persist the change to the database
      const groupId = targetGroup.id;
      if (!groupId) {
        toast.error("Cannot assign guide: Group ID is missing");
        return false;
      }
      
      // Generate a new group name
      const groupName = actualGuideId 
        ? `Group ${groupIndex + 1} (${guideName})` 
        : `Group ${groupIndex + 1}`;
      
      // Save to database
      const updateSuccess = await updateGuideInSupabase(
        tourId,
        groupId,
        actualGuideId,
        groupName
      );
      
      if (updateSuccess) {
        // Record the modification
        const modificationDescription = actualGuideId 
          ? `Assigned guide ${guideName} to Group ${groupIndex + 1}` 
          : `Removed guide from Group ${groupIndex + 1}`;
          
        await addModification(modificationDescription, {
          groupIndex,
          groupId,
          guideId: actualGuideId,
          guideName
        });
        
        // Force a refetch after a delay to ensure server data is synced
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
          queryClient.invalidateQueries({ queryKey: ['tours'] });
          refetch();
        }, 500);
        
        toast.success(actualGuideId 
          ? `Guide ${guideName} assigned to Group ${groupIndex + 1}` 
          : `Guide removed from Group ${groupIndex + 1}`
        );
        
        return true;
      } else {
        toast.error("Failed to assign guide");
        // Revert optimistic update
        await refetch();
        return false;
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide due to an error");
      // Revert optimistic update
      await refetch();
      return false;
    }
  }, [tour, tourId, guides, addModification, queryClient, refetch]);
  
  return { assignGuide };
};
