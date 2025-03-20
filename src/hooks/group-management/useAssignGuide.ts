
import { useTourById } from "../tourData/useTourById";
import { useGuideData } from "../guides/useGuideData";
import { useModifications } from "../useModifications";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const assignGuide = useCallback(async (groupIndex: number, guideId?: string | null) => {
    try {
      if (!tour) {
        console.error("Cannot assign guide: Tour data not available");
        return false;
      }
      
      console.log("Starting guide assignment:", { 
        groupIndex, 
        guideId, 
        tourId, 
        currentGroups: tour.tourGroups?.map(g => ({id: g.id, name: g.name, guideId: g.guideId})) || []
      });
      
      // Validate groupIndex is within bounds
      if (groupIndex < 0 || groupIndex >= (tour.tourGroups?.length || 0)) {
        console.error(`Invalid group index: ${groupIndex}. Available groups: ${tour.tourGroups?.length}`);
        toast.error("Cannot assign guide: Invalid group");
        return false;
      }
      
      // Special handling for "_none" which means "remove guide"
      const actualGuideId = guideId === "_none" ? null : guideId;
      
      // Validate that if a guide ID is provided, it must be a valid UUID
      if (actualGuideId && !isValidUuid(actualGuideId)) {
        console.error(`Invalid guide ID format: ${actualGuideId}. Must be a valid UUID.`);
        toast.error("Cannot assign guide: Invalid guide ID format");
        return false;
      }
      
      // Get the target group
      const targetGroup = tour.tourGroups?.[groupIndex];
      if (!targetGroup) {
        toast.error("Group not found");
        return false;
      }
      
      // Find guide name for display
      let guideName = "Unassigned";
      if (actualGuideId) {
        const guide = guides.find(g => g.id === actualGuideId);
        if (guide) {
          guideName = guide.name;
          console.log(`Found guide name: ${guideName} for ID: ${actualGuideId}`);
        } else {
          console.warn(`Could not find guide name for ID: ${actualGuideId} in available guides`);
          // Try harder to find the name
          if (tour.guide1Id === actualGuideId && tour.guide1) {
            guideName = tour.guide1;
          } else if (tour.guide2Id === actualGuideId && tour.guide2) {
            guideName = tour.guide2;
          } else if (tour.guide3Id === actualGuideId && tour.guide3) {
            guideName = tour.guide3;
          }
        }
      }
      
      // Get the group ID
      const groupId = targetGroup.id;
      if (!groupId) {
        toast.error("Cannot assign guide: Group ID is missing");
        return false;
      }
      
      // Get group number for name generation
      const groupNumber = groupIndex + 1;
      
      // Generate a new group name with the guide name
      const groupName = actualGuideId 
        ? `Group ${groupNumber} (${guideName})` 
        : `Group ${groupNumber}`;
      
      console.log("Calling updateGuideInSupabase with:", {
        tourId,
        groupId,
        actualGuideId,
        guideName,
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
        // Apply optimistic update to the UI
        queryClient.setQueryData(['tour', tourId], (oldData: any) => {
          if (!oldData) return null;
          
          // Create a deep copy to avoid reference issues
          const newData = JSON.parse(JSON.stringify(oldData));
          
          // Update the specific group
          if (newData.tourGroups && newData.tourGroups[groupIndex]) {
            newData.tourGroups[groupIndex].guideId = actualGuideId;
            newData.tourGroups[groupIndex].name = groupName;
            
            // Also update guideName if present
            if (actualGuideId) {
              newData.tourGroups[groupIndex].guideName = guideName;
            } else {
              newData.tourGroups[groupIndex].guideName = undefined;
            }
          }
          
          return newData;
        });
        
        // Record the modification
        const modificationDescription = actualGuideId 
          ? `Assigned guide ${guideName} to Group ${groupNumber}` 
          : `Removed guide from Group ${groupNumber}`;
          
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
        }, 800);
        
        toast.success(actualGuideId 
          ? `Guide ${guideName} assigned to Group ${groupNumber}` 
          : `Guide removed from Group ${groupNumber}`
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
