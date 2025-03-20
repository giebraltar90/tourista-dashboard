
import { useTourById } from "../tourData/useTourById";
import { useGuideData } from "../guides/useGuideData";
import { useModifications } from "../useModifications";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import {
  validateGuideAssignment,
  findGuideName,
  generateGroupNameWithGuide,
  applyOptimisticUpdate,
  createModificationDescription,
  refreshCacheAfterAssignment
} from "./services/guideAssignmentService";

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
      console.log("Starting guide assignment:", { 
        groupIndex, 
        guideId, 
        tourId, 
        currentGroups: tour?.tourGroups?.map(g => ({id: g.id, name: g.name, guideId: g.guideId})) || []
      });
      
      // Validate parameters
      const validationResult = validateGuideAssignment(tour, groupIndex, guideId);
      if (!validationResult.valid) {
        console.error(validationResult.errorMessage);
        toast.error(validationResult.errorMessage || "Cannot assign guide");
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
      const targetGroup = tour!.tourGroups![groupIndex];
      const groupId = targetGroup.id;
      
      // Get group number for name generation
      const groupNumber = groupIndex + 1;
      
      // Find guide name for display
      const guideName = findGuideName(actualGuideId, guides, tour);
      
      // Generate a new group name with the guide name
      const groupName = generateGroupNameWithGuide(groupNumber, guideName);
      
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
        applyOptimisticUpdate(
          queryClient,
          tourId,
          groupIndex,
          actualGuideId,
          groupName,
          guideName
        );
        
        // Record the modification
        const modificationDescription = createModificationDescription(
          actualGuideId,
          guideName,
          groupNumber
        );
          
        await addModification(modificationDescription, {
          groupIndex,
          groupId,
          guideId: actualGuideId,
          guideName
        });
        
        // Refresh data to ensure sync with server
        refreshCacheAfterAssignment(queryClient, tourId, refetch);
        
        // Show success message
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
