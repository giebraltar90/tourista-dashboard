
import { useTourById } from "../tourData/useTourById";
import { useGuideData } from "../guides/useGuideData";
import { useModifications } from "../useModifications";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Import refactored utilities
import { mapGuideIdToUuid } from "./utils/guideAssignmentMapping";
import { validateGuideAssignment } from "./utils/guideAssignmentValidation";
import { preserveParticipants, createUpdatedGroupWithPreservedParticipants } from "./utils/participantPreservation";
import { findGuideName, generateGroupNameWithGuide, createModificationDescription } from "./utils/groupNaming";
import { persistGuideAssignmentChanges } from "./utils/databaseOperations";
import { performOptimisticUpdate, handleUIUpdates } from "./utils/optimisticUpdates";

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
      console.log("Starting guide assignment:", { groupIndex, guideId, tourId });
      
      // Validate parameters
      const validationResult = validateGuideAssignment(tour, groupIndex, guideId);
      if (!validationResult.valid) {
        console.error(validationResult.errorMessage);
        toast.error(validationResult.errorMessage || "Cannot assign guide");
        return false;
      }
      
      // Special handling for "_none" which means "remove guide"
      const actualGuideId = guideId === "_none" ? null : 
                           (guideId ? mapGuideIdToUuid(guideId, tour, guides) : null);
      
      console.log("Guide ID mapping result:", {
        originalId: guideId,
        mappedId: actualGuideId
      });
      
      // Validate that if a guide ID is provided, it should be mapped to a valid UUID
      if (guideId && guideId !== "_none" && !actualGuideId) {
        console.error(`Failed to map guide ID "${guideId}" to a valid UUID`);
        toast.error("Cannot assign guide: Invalid guide ID format or mapping failed");
        return false;
      }
      
      // Get the target group
      const targetGroup = tour!.tourGroups![groupIndex];
      const groupId = targetGroup.id;
      
      // Preserve participants to avoid losing them during update
      const existingParticipants = preserveParticipants(targetGroup);
      
      // Log existing participants for debugging
      console.log("PARTICIPANTS PRESERVATION: Existing participants before guide change:", {
        groupId,
        participantsCount: existingParticipants.length
      });
      
      // Get group number for name generation
      const groupNumber = groupIndex + 1;
      
      // Find guide name for display
      const guideName = findGuideName(actualGuideId, guides, tour);
      
      // Generate a new group name with the guide name
      const groupName = generateGroupNameWithGuide(groupNumber, guideName);
      
      // Prepare for optimistic UI update
      const updatedGroups = [...tour!.tourGroups!];
      updatedGroups[groupIndex] = createUpdatedGroupWithPreservedParticipants(
        updatedGroups[groupIndex],
        actualGuideId,
        groupName,
        existingParticipants
      );
      
      // Apply optimistic update to UI
      performOptimisticUpdate(queryClient, tourId, updatedGroups);
      
      // Save to database
      const updateSuccess = await persistGuideAssignmentChanges(
        tourId,
        groupId,
        actualGuideId,
        groupName,
        updatedGroups
      );
      
      // Update UI based on result
      await handleUIUpdates(tourId, queryClient, actualGuideId, guideName, updateSuccess);
      
      if (updateSuccess) {
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
          guideName,
          participantCount: existingParticipants.length
        });
        
        // Force a refresh to ensure data consistency, but don't lose participants
        setTimeout(() => {
          // Use a custom invalidation that preserves participants
          queryClient.setQueryData(['tour', tourId], (oldData: any) => {
            if (!oldData) return null;
            
            // Deep clone the data to avoid reference issues
            const newData = JSON.parse(JSON.stringify(oldData));
            
            // Update the specific group data while preserving participants
            if (newData.tourGroups && newData.tourGroups[groupIndex]) {
              newData.tourGroups[groupIndex].guideId = actualGuideId;
              newData.tourGroups[groupIndex].name = groupName;
              
              // Preserve participants if they exist
              if (!Array.isArray(newData.tourGroups[groupIndex].participants) || 
                  newData.tourGroups[groupIndex].participants.length === 0) {
                newData.tourGroups[groupIndex].participants = existingParticipants;
              }
            }
            
            return newData;
          });
        }, 1000);
        
        return true;
      } else {
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
