
import { useTourById } from "../tourData/useTourById";
import { useGuideData } from "../useGuideData";
import { useModifications } from "../useModifications";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
      
      console.log("Starting guide assignment:", { 
        groupIndex, 
        guideId, 
        tourId, 
        currentGroups: tour.tourGroups.map(g => ({id: g.id, name: g.name, guideId: g.guideId}))
      });
      
      // Validate groupIndex is within bounds
      if (groupIndex < 0 || groupIndex >= (tour.tourGroups?.length || 0)) {
        console.error(`Invalid group index: ${groupIndex}. Available groups: ${tour.tourGroups?.length}`);
        toast.error("Cannot assign guide: Invalid group");
        return false;
      }
      
      // Special handling for "_none" which means "remove guide"
      const uiGuideId = guideId === "_none" ? undefined : guideId;
      
      // Validate that if a guide ID is provided, it must be a valid UUID
      if (uiGuideId && !isValidUuid(uiGuideId)) {
        console.error(`Invalid guide ID format: ${uiGuideId}. Must be a valid UUID.`);
        toast.error("Cannot assign guide: Invalid guide ID format");
        return false;
      }
      
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
      
      // Pass the guideId as is - the updateGuideInSupabase function will validate it
      const actualGuideId = uiGuideId;
      
      // Find guide name for display
      let guideName = "Unassigned";
      if (uiGuideId) {
        const guide = guides.find(g => g.id === uiGuideId);
        if (guide) {
          guideName = guide.name;
        }
      }
      
      console.log("Before optimistic update:", {
        targetGroupId: targetGroup.id,
        targetGroupName: targetGroup.name,
        currentGuideId: targetGroup.guideId,
        newGuideId: uiGuideId,
        actualGuideId,
        guideName
      });
      
      // Apply optimistic update to the cache
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        
        // Create a deep copy to avoid reference issues
        const newData = JSON.parse(JSON.stringify(oldData));
        
        // Update the specific group
        if (newData.tourGroups[groupIndex]) {
          console.log("Applying optimistic update to cache:", {
            groupId: newData.tourGroups[groupIndex].id,
            oldGuideId: newData.tourGroups[groupIndex].guideId,
            newGuideId: uiGuideId
          });
          
          newData.tourGroups[groupIndex].guideId = uiGuideId;
        }
        
        return newData;
      });
      
      // Get the group ID
      const groupId = targetGroup.id;
      if (!groupId) {
        toast.error("Cannot assign guide: Group ID is missing");
        return false;
      }
      
      // Generate a new group name
      const groupName = uiGuideId 
        ? `Group ${groupIndex + 1} (${guideName})` 
        : `Group ${groupIndex + 1}`;
      
      console.log("Calling updateGuideInSupabase with:", {
        tourId,
        groupId,
        actualGuideId,
        groupName
      });
      
      // Save to database - directly passing the guide ID without mapping
      const updateSuccess = await updateGuideInSupabase(
        tourId,
        groupId,
        actualGuideId,
        groupName
      );
      
      console.log("Database update result:", updateSuccess ? "Success" : "Failed");
      
      if (updateSuccess) {
        // Record the modification
        const modificationDescription = uiGuideId 
          ? `Assigned guide ${guideName} to Group ${groupIndex + 1}` 
          : `Removed guide from Group ${groupIndex + 1}`;
          
        await addModification(modificationDescription, {
          groupIndex,
          groupId,
          guideId: uiGuideId,
          guideName
        });
        
        // Force a refetch after a delay to ensure server data is synced
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
          queryClient.invalidateQueries({ queryKey: ['tours'] });
          refetch();
        }, 500);
        
        toast.success(uiGuideId 
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
